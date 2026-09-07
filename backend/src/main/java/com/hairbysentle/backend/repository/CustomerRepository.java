package com.hairbysentle.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hairbysentle.backend.model.Customer;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Find customer by email (used for login + duplicate check)
    Customer findByEmail(String email);

    // Optional: check if email already exists
    boolean existsByEmail(String email);
}
