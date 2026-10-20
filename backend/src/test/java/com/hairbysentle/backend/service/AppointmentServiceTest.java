package com.hairbysentle.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalTime;

import org.junit.jupiter.api.Test;

import com.hairbysentle.backend.dto.BookingRequest;
import com.hairbysentle.backend.model.Appointment;
import com.hairbysentle.backend.repository.AppointmentRepository;

class AppointmentServiceTest {

    @Test
    void getAvailability_shouldReturnHalfHourSlotsAndMarkBookedTimeUnavailable() {
        AppointmentRepository appointmentRepository = mock(AppointmentRepository.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository, mock(EmailSender.class), mock(WhatsAppSender.class));
        LocalDate date = LocalDate.now().plusDays(1);
        while (date.getDayOfWeek().getValue() == 1 || date.getDayOfWeek().getValue() == 7) {
            date = date.plusDays(1);
        }
        when(appointmentRepository.existsByDateAndTime(date, LocalTime.of(9, 0))).thenReturn(true);

        var slots = appointmentService.getAvailability(date);

        assertEquals(16, slots.size());
        assertFalse(slots.get(0).available());
        assertTrue(slots.get(1).available());
        assertEquals(LocalTime.of(16, 30), slots.get(15).time());
    }

    @Test
    void createAppointment_shouldRejectAlreadyBookedSlot() {
        AppointmentRepository appointmentRepository = mock(AppointmentRepository.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository, mock(EmailSender.class), mock(WhatsAppSender.class));
        BookingRequest request = new BookingRequest();
        request.customerName = "Lerato Mokoena";
        request.email = "lerato@example.com";
        request.service = "Hair Installation";
        request.date = LocalDate.now().plusDays(1);
        while (request.date.getDayOfWeek().getValue() == 1 || request.date.getDayOfWeek().getValue() == 7) {
            request.date = request.date.plusDays(1);
        }
        request.time = LocalTime.of(10, 0);
        when(appointmentRepository.existsByDateAndTime(request.date, request.time)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> appointmentService.createAppointment(request));
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    void createAppointment_shouldSaveBookingAndNotifyCustomerAndOwner() {
        AppointmentRepository appointmentRepository = mock(AppointmentRepository.class);
        EmailSender emailSender = mock(EmailSender.class);
        WhatsAppSender whatsAppSender = mock(WhatsAppSender.class);
        AppointmentService appointmentService = new AppointmentService(appointmentRepository, emailSender, whatsAppSender);

        BookingRequest request = new BookingRequest();
        request.customerName = "Lerato Mokoena";
        request.email = "lerato@example.com";
        request.phone = "0712345678";
        request.service = "Hair Installation";
        request.date = LocalDate.of(2026, 10, 20);
        request.time = LocalTime.of(10, 30);
        request.message = "Please include a scalp treatment.";

        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Appointment result = appointmentService.createAppointment(request);

        assertEquals("Hair Installation", result.getService());
        assertEquals("Lerato Mokoena", result.getCustomerName());
        verify(emailSender).sendBookingConfirmation(any(String.class), any(String.class));
        verify(whatsAppSender).sendAppointmentNotification(any(Appointment.class));
    }
}
