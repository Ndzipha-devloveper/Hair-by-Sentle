package com.hairbysentle.backend.service;

public interface EmailSender {

    void sendVerificationEmail(String email, String verificationLink);

    void sendBookingConfirmation(String email, String bookingDetails);
}