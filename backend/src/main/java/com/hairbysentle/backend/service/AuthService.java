package com.hairbysentle.backend.service;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import com.hairbysentle.backend.dto.RegisterRequest;
import com.hairbysentle.backend.model.Customer;
import com.hairbysentle.backend.repository.CustomerRepository;

@Service
public class AuthService {

    private final CustomerRepository customerRepository;

    public AuthService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // REGISTER
    public String register(RegisterRequest request) {

        if (customerRepository.existsByEmail(request.email)) {
            return "User already exists";
        }

        Customer customer = new Customer();
        customer.setFirstName(request.firstName);
        customer.setLastName(request.lastName);
        customer.setEmail(request.email);
        customer.setPhone(request.phone);

        // REQUIRED FIELD
        customer.setPreferredContactMethod(request.preferredContactMethod);

        // REQUIRED FIELD — hashes inside setter
        customer.setPasswordHash(request.password);

        customerRepository.save(customer);

        return "User registered successfully";
    }

    // LOGIN
    public String login(String email, String password) {

        Customer customer = customerRepository.findByEmail(email);

        if (customer == null) {
            return "User not found";
        }

        boolean passwordMatch = BCrypt.checkpw(password, customer.getPasswordHash());

        if (!passwordMatch) {
            return "Incorrect password";
        }

        return "Login successful";
    }
}
