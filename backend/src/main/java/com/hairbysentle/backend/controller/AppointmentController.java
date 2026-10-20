package com.hairbysentle.backend.controller;

import java.time.LocalDate;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hairbysentle.backend.dto.BookingRequest;
import com.hairbysentle.backend.model.Appointment;
import com.hairbysentle.backend.service.AppointmentService;

@RestController
@RequestMapping("/api")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/appointments/availability")
    public ResponseEntity<?> getAvailability(@RequestParam LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailability(date));
    }

    @PostMapping("/appointments")
    public ResponseEntity<?> bookAppointment(@RequestBody BookingRequest request) {
        try {
            Appointment saved = appointmentService.createAppointment(request);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body("That appointment time has just been booked. Please choose another time.");
        }
    }
}
