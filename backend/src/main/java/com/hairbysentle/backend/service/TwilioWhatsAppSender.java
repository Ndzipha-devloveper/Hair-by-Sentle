package com.hairbysentle.backend.service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.hairbysentle.backend.model.Appointment;

@Service
public class TwilioWhatsAppSender implements WhatsAppSender {

    private static final Logger log = LoggerFactory.getLogger(TwilioWhatsAppSender.class);

    private final String accountSid;
    private final String authToken;
    private final String fromNumber;
    private final String ownerPhone;
    private final HttpClient httpClient;

    public TwilioWhatsAppSender(
            @Value("${twilio.account-sid:}") String accountSid,
            @Value("${twilio.auth-token:}") String authToken,
            @Value("${twilio.whatsapp.from:}") String fromNumber,
            @Value("${app.owner.whatsapp-phone:}") String ownerPhone) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;
        this.ownerPhone = ownerPhone;
        this.httpClient = HttpClient.newHttpClient();
    }

    @Override
    public void sendAppointmentNotification(Appointment appointment) {
        if (accountSid == null || accountSid.isBlank() || authToken == null || authToken.isBlank()
                || fromNumber == null || fromNumber.isBlank() || ownerPhone == null || ownerPhone.isBlank()) {
            log.info("Twilio WhatsApp not configured. Skipping appointment notification for {}.", appointment.getCustomerName());
            return;
        }

        try {
            String message = "Hair by Sentle: New appointment booking\n"
                    + "Customer: " + appointment.getCustomerName() + "\n"
                    + "Email: " + appointment.getEmail() + "\n"
                    + "Phone: " + appointment.getPhone() + "\n"
                    + "Service: " + appointment.getService() + "\n"
                    + "Date: " + appointment.getDate() + "\n"
                    + "Time: " + appointment.getTime() + "\n"
                    + "Notes: " + (appointment.getMessage() == null || appointment.getMessage().isBlank() ? "None supplied" : appointment.getMessage());

            String body = "From=" + URLEncoder.encode(normalizeFrom(fromNumber), StandardCharsets.UTF_8)
                    + "&To=" + URLEncoder.encode(normalizeTo(ownerPhone), StandardCharsets.UTF_8)
                    + "&Body=" + URLEncoder.encode(message, StandardCharsets.UTF_8);
            String credentials = Base64.getEncoder().encodeToString((accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json"))
                    .header("Authorization", "Basic " + credentials)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                throw new IllegalStateException("Twilio WhatsApp request failed: " + response.statusCode() + " - " + response.body());
            }
            log.info("WhatsApp appointment notification sent to {}", ownerPhone);
        } catch (Exception ex) {
            log.error("Failed to send appointment notification for {}", appointment.getCustomerName(), ex);
        }
    }

    private String normalizeFrom(String value) {
        String normalized = value.trim();
        if (normalized.startsWith("whatsapp:")) {
            return normalized;
        }
        if (normalized.startsWith("+")) {
            return "whatsapp:" + normalized;
        }
        return "whatsapp:+" + normalized;
    }

    private String normalizeTo(String value) {
        String normalized = value.trim();
        if (normalized.startsWith("whatsapp:")) {
            return normalized;
        }
        if (normalized.startsWith("+")) {
            return "whatsapp:" + normalized;
        }
        return "whatsapp:+" + normalized;
    }
}
