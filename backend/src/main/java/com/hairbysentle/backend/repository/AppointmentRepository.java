package com.hairbysentle.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hairbysentle.backend.model.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByEmailOrderByCreatedAtDesc(String email);
}
