package com.hairbysentle.backend.service;

import com.hairbysentle.backend.model.Appointment;

public interface WhatsAppSender {

    void sendAppointmentNotification(Appointment appointment);
}
