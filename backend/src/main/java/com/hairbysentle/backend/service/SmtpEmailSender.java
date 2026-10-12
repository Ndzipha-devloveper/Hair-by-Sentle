package com.hairbysentle.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public SmtpEmailSender(JavaMailSender mailSender,
                           @Value("${app.mail.from:${spring.mail.username:no-reply@hairbysentle.com}}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Override
    public void sendVerificationEmail(String email, String verificationLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email);
        message.setSubject("Verify your Hair by Sentle account");
        message.setText("Confirm your email address by opening this link:\n\n" + verificationLink
                + "\n\nThis link expires in 24 hours.");
        mailSender.send(message);
    }

    @Override
    public void sendBookingConfirmation(String email, String bookingDetails) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email);
        message.setSubject("Your Hair by Sentle appointment confirmation");
        message.setText("Thank you for booking with Hair by Sentle.\n\n" + bookingDetails);
        mailSender.send(message);
    }
}