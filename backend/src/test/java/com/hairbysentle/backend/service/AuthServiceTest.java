package com.hairbysentle.backend.service;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hairbysentle.backend.dao.CustomerDao;
import com.hairbysentle.backend.dao.PendingRegistrationDao;
import com.hairbysentle.backend.dto.RegisterRequest;
import com.hairbysentle.backend.model.Customer;
import com.hairbysentle.backend.model.PendingRegistration;

class AuthServiceTest {

    private CustomerDao customerDao;
    private PendingRegistrationDao pendingRegistrationDao;
    private EmailSender emailSender;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        customerDao = mock(CustomerDao.class);
        pendingRegistrationDao = mock(PendingRegistrationDao.class);
        emailSender = mock(EmailSender.class);
        authService = new AuthService(customerDao, pendingRegistrationDao, emailSender, "http://localhost:8080");
    }

    @Test
    void register_shouldCreatePendingRegistrationAndSendVerificationEmail() {
        RegisterRequest request = new RegisterRequest();
        request.firstName = "Lerato";
        request.lastName = "Mokoena";
        request.email = "lerato@example.com";
        request.phone = "0712345678";
        request.preferredContactMethod = "Email";
        request.password = "Password123";

        when(customerDao.existsByEmail(request.email)).thenReturn(false);
        when(pendingRegistrationDao.findByEmail(request.email)).thenReturn(null);

        String result = authService.register(request);

        assertEquals("Please check your email to verify your account", result);
        verify(pendingRegistrationDao).save(any(PendingRegistration.class));
        verify(emailSender).sendVerificationEmail(eq(request.email), any(String.class));
    }

    @Test
    void verifyEmail_shouldCreateCustomerAfterSuccessfulVerification() {
        String token = "valid-token";
        PendingRegistration pending = new PendingRegistration(
                "lerato@example.com",
                "Lerato",
                "Mokoena",
                "0712345678",
                "Email",
                "hashed-password",
                "hashed-token",
                Instant.now().plusSeconds(60 * 60)
        );

        when(pendingRegistrationDao.findByTokenHash(any(String.class))).thenReturn(pending);
        when(customerDao.existsByEmail(pending.getEmail())).thenReturn(false);

        String result = authService.verifyEmail(token);

        assertEquals("Email verified. Your account has been created", result);
        verify(customerDao).save(any(Customer.class));
    }

    @Test
    void login_shouldSucceedWhenCredentialsAreValid() {
        Customer customer = new Customer();
        customer.setUsername("lerato@example.com");
        customer.setFirstName("Lerato");
        customer.setLastName("Mokoena");
        customer.setEmail("lerato@example.com");
        customer.setPhone("0712345678");
        customer.setPreferredContactMethod("Email");
        customer.setStoredPasswordHash(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("Password123"));

        when(customerDao.findByEmail("lerato@example.com")).thenReturn(customer);

        String result = authService.login("lerato@example.com", "Password123");

        assertEquals("Login successful", result);
    }
}
