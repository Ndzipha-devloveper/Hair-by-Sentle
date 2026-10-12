package com.hairbysentle.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.hairbysentle.backend.dao.CustomerDao;
import com.hairbysentle.backend.dao.PendingRegistrationDao;
import com.hairbysentle.backend.dto.RegisterRequest;
import com.hairbysentle.backend.model.Customer;
import com.hairbysentle.backend.model.PendingRegistration;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final CustomerDao customerDao;
    private final PendingRegistrationDao pendingRegistrationDao;
    private final EmailSender emailSender;
    private final String verificationBaseUrl;

    public AuthService(CustomerDao customerDao, PendingRegistrationDao pendingRegistrationDao,
                       EmailSender emailSender,
                       @org.springframework.beans.factory.annotation.Value("${app.verification.base-url:http://localhost:8080}") String verificationBaseUrl) {
        this.customerDao = customerDao;
        this.pendingRegistrationDao = pendingRegistrationDao;
        this.emailSender = emailSender;
        this.verificationBaseUrl = verificationBaseUrl;
    }

    @Transactional
    public String register(RegisterRequest request) {

        if (customerDao.existsByEmail(request.email)) {
            return "User already exists";
        }

        Customer customer = new Customer(
            request.firstName,
            request.lastName,
            request.email,
            request.phone,
            request.preferredContactMethod,
            request.password);
        String token = UUID.randomUUID().toString();
        PendingRegistration previous = pendingRegistrationDao.findByEmail(request.email);
        if (previous != null) {
            pendingRegistrationDao.delete(previous);
        }

        pendingRegistrationDao.save(new PendingRegistration(
                request.email,
                customer.getFirstName(),
                customer.getLastName(),
                customer.getPhone(),
                customer.getPreferredContactMethod(),
                customer.getPasswordHash(),
                hashToken(token),
                Instant.now().plus(24, ChronoUnit.HOURS)));

        // Send the verification email only after the pending registration is
        // committed, and never let a slow/failing SMTP call block or fail the
        // HTTP response. Delivery problems are logged for the operator instead.
        final String email = request.email;
        final String verificationLink = verificationBaseUrl + "/auth/verify?token=" + token;
        Runnable send = () -> {
            try {
                emailSender.sendVerificationEmail(email, verificationLink);
            } catch (RuntimeException ex) {
                log.error("Failed to send verification email to {}", email, ex);
            }
        };
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    send.run();
                }
            });
        } else {
            send.run();
        }

        return "Please check your email to verify your account";
    }

    @Transactional
    public String verifyEmail(String token) {
        PendingRegistration pending = pendingRegistrationDao.findByTokenHash(hashToken(token));
        if (pending == null) {
            return "Invalid or expired verification link";
        }
        if (pending.getExpiresAt().isBefore(Instant.now())) {
            pendingRegistrationDao.delete(pending);
            return "Invalid or expired verification link";
        }
        if (customerDao.existsByEmail(pending.getEmail())) {
            pendingRegistrationDao.delete(pending);
            return "User already exists";
        }

        Customer customer = new Customer();
        customer.setUsername(pending.getEmail());
        customer.setFirstName(pending.getFirstName());
        customer.setLastName(pending.getLastName());
        customer.setEmail(pending.getEmail());
        customer.setPhone(pending.getPhone());
        customer.setPreferredContactMethod(pending.getPreferredContactMethod());
        customer.setStoredPasswordHash(pending.getPasswordHash());
        customerDao.save(customer);
        pendingRegistrationDao.delete(pending);
        return "Email verified. Your account has been created";
    }

    // LOGIN
    public String login(String email, String password) {

        Customer customer = customerDao.findByEmail(email);

        if (customer == null) {
            return "User not found";
        }

        if (!customer.checkPassword(password)) {
            return "Incorrect password";
        }

        return "Login successful";
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
