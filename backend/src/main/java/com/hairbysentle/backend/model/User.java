package com.hairbysentle.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    @NotBlank
    @Size(min = 2, max = 50)
    @Column(nullable = false)
    private String firstName;

    @NotBlank
    @Size(min = 2, max = 50)
    @Column(nullable = false)
    private String lastName;

    @NotBlank
    @Email
    @Size(max = 100)
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Size(min = 6, max = 255)
    @Column(nullable = false)
    private String password;

    @Column
    private String phoneNumber;

    @Column
    private String homeAddress;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public User() {
    }

    public User(String firstName, String lastName, String email, String password,
                String phoneNumber, String homeAddress) {
        setFirstName(firstName);
        setLastName(lastName);
        setEmail(email);
        setPassword(password);
        setPhone(phoneNumber);
        this.homeAddress = homeAddress;
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setUserId(Long customerId) {
        this.customerId = customerId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        if (firstName == null || firstName.isBlank()) {
            throw new IllegalArgumentException("First name cannot be blank.");
        }
        if (firstName.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Invalid name. Name cannot contain numbers.");
        }
        if (firstName.length() < 2) {
            throw new IllegalArgumentException("First name must have at least 2 characters.");
        }
        if (firstName.length() > 50) {
            throw new IllegalArgumentException("First name cannot exceed 50 characters.");
        }
        if (firstName.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            throw new IllegalArgumentException("First name cannot contain special characters.");
        }
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        if (lastName == null || lastName.isBlank()) {
            throw new IllegalArgumentException("Last name cannot be blank.");
        }
        if (lastName.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Invalid name. Name cannot contain numbers.");
        }
        if (lastName.length() < 2) {
            throw new IllegalArgumentException("Last name must have at least 2 characters.");
        }
        if (lastName.length() > 50) {
            throw new IllegalArgumentException("Last name cannot exceed 50 characters.");
        }
        if (lastName.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            throw new IllegalArgumentException("Last name cannot contain special characters.");
        }
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email cannot be blank.");
        }
        if (email.length() > 100) {
            throw new IllegalArgumentException("Invalid email.");
        }
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IllegalArgumentException("Invalid email.");
        }
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password cannot be blank.");
        }
        if (password.length() < 6) {
            throw new IllegalArgumentException("Password must have at least 6 characters.");
        }
        this.password = password;
    }

    public String getPhone() {
        return phoneNumber;
    }

    public void setPhone(String phoneNumber) {

        if(phoneNumber == null || phoneNumber.isBlank()) {
            throw new IllegalArgumentException("Phone number cannot be blank.");
        }
      if(phoneNumber.length() < 10) {
            throw new IllegalArgumentException("Phone number must be 10 digits long.");
        }
        if(!phoneNumber.matches("\\d+")) {
            throw new IllegalArgumentException("Phone number can only contain digits.");
        }
        

        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return homeAddress;
    }

    public void setAddress(String homeAddress) {
        if(homeAddress == null || homeAddress.isBlank()) {
            throw new IllegalArgumentException("Home address cannot be blank.");
        }
        if (homeAddress.length() > 100) {
            throw new IllegalArgumentException("Home address cannot exceed 100 characters.");
        }
    
        this.homeAddress = homeAddress;
    }

    public LocalDateTime getDate() {
        return createdAt;
    }
}
