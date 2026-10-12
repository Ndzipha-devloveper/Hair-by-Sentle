package com.hairbysentle.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalTime;

import org.junit.jupiter.api.Test;

import com.hairbysentle.backend.dto.BookingRequest;
import com.hairbysentle.backend.model.Appointment;
import com.hairbysentle.backend.repository.AppointmentRepository;

class AppointmentServiceTest {

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
