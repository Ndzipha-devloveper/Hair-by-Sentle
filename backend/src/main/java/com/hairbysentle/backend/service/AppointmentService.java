package com.hairbysentle.backend.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.hairbysentle.backend.dto.BookingRequest;
import com.hairbysentle.backend.model.Appointment;
import com.hairbysentle.backend.repository.AppointmentRepository;

@Service
public class AppointmentService {

    private static final LocalTime OPENING_TIME = LocalTime.of(9, 0);
    private static final LocalTime CLOSING_TIME = LocalTime.of(17, 0);
    private static final int SLOT_MINUTES = 30;

    private final AppointmentRepository appointmentRepository;
    private final EmailSender emailSender;
    private final WhatsAppSender whatsAppSender;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              EmailSender emailSender,
                              WhatsAppSender whatsAppSender) {
        this.appointmentRepository = appointmentRepository;
        this.emailSender = emailSender;
        this.whatsAppSender = whatsAppSender;
    }

    public Appointment createAppointment(BookingRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Appointment request is required");
        }
        if (request.customerName == null || request.customerName.isBlank()) {
            throw new IllegalArgumentException("Customer name is required");
        }
        if (request.email == null || request.email.isBlank()) {
            throw new IllegalArgumentException("Customer email is required");
        }
        if (request.service == null || request.service.isBlank()) {
            throw new IllegalArgumentException("Service is required");
        }
        if (request.date == null) {
            throw new IllegalArgumentException("Appointment date is required");
        }
        if (request.time == null) {
            throw new IllegalArgumentException("Appointment time is required");
        }
        if (request.date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Appointment date must be today or later");
        }
        if (!isWorkingDay(request.date) || !isValidSlot(request.time)) {
            throw new IllegalArgumentException("Please choose one of the available appointment times");
        }
        if (appointmentRepository.existsByDateAndTime(request.date, request.time)) {
            throw new IllegalArgumentException("That appointment time has just been booked. Please choose another time.");
        }

        Appointment appointment = new Appointment();
        appointment.setCustomerName(request.customerName.trim());
        appointment.setEmail(request.email.trim());
        appointment.setPhone(request.phone == null ? "" : request.phone.trim());
        appointment.setService(request.service.trim());
        appointment.setDate(request.date);
        appointment.setTime(request.time);
        appointment.setMessage(request.message == null ? "" : request.message.trim());
        appointment.setStatus("PENDING");

        appointmentRepository.save(appointment);

        String bookingDetails = "Dear " + appointment.getCustomerName() + ",\n"
                + "Thank you for booking with Hair by Sentle.\n\n"
                + "Service: " + appointment.getService() + "\n"
                + "Date: " + appointment.getDate().format(DateTimeFormatter.ofPattern("EEEE, d MMMM yyyy")) + "\n"
                + "Time: " + appointment.getTime().format(DateTimeFormatter.ofPattern("h:mm a")) + "\n"
                + "Contact: " + appointment.getPhone() + "\n"
                + "Notes: " + (appointment.getMessage().isBlank() ? "None supplied" : appointment.getMessage()) + "\n\n"
                + "We look forward to seeing you.";

        emailSender.sendBookingConfirmation(appointment.getEmail(), bookingDetails);
        whatsAppSender.sendAppointmentNotification(appointment);
        return appointment;
    }

    public List<AvailabilitySlot> getAvailability(LocalDate date) {
        if (date == null || date.isBefore(LocalDate.now()) || !isWorkingDay(date)) {
            return List.of();
        }

        List<AvailabilitySlot> slots = new ArrayList<>();
        for (LocalTime time = OPENING_TIME; time.isBefore(CLOSING_TIME); time = time.plusMinutes(SLOT_MINUTES)) {
            slots.add(new AvailabilitySlot(time, !appointmentRepository.existsByDateAndTime(date, time)));
        }
        return slots;
    }

    private boolean isWorkingDay(LocalDate date) {
        return date.getDayOfWeek().getValue() >= 2 && date.getDayOfWeek().getValue() <= 6;
    }

    private boolean isValidSlot(LocalTime time) {
        if (time.isBefore(OPENING_TIME) || !time.isBefore(CLOSING_TIME)) {
            return false;
        }
        return time.getMinute() % SLOT_MINUTES == 0 && time.getSecond() == 0 && time.getNano() == 0;
    }

    public record AvailabilitySlot(LocalTime time, boolean available) {
    }
}
