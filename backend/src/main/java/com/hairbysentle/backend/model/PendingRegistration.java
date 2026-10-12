package com.hairbysentle.backend.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "pending_registrations")
public class PendingRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    private String phone;

    @Column(name = "preferred_contact_method", nullable = false)
    private String preferredContactMethod;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    protected PendingRegistration() {
    }

    public PendingRegistration(String email, String firstName, String lastName, String phone,
                                String preferredContactMethod, String passwordHash,
                                String tokenHash, Instant expiresAt) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.preferredContactMethod = preferredContactMethod;
        this.passwordHash = passwordHash;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getPhone() { return phone; }
    public String getPreferredContactMethod() { return preferredContactMethod; }
    public String getPasswordHash() { return passwordHash; }
    public Instant getExpiresAt() { return expiresAt; }
}