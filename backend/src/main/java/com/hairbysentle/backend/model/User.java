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
        // Required by JPA
    }

    public User(String firstName, String lastName, String email, String password, String phoneNumber,
                String homeAddress) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.homeAddress = homeAddress;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /*
        Getter and Setter methods
    */

    public  Long getCustomerId(){
        return customerId;
    }

    public String getFirstName(){
        return firstName;
    }

    public String getLastName(){
        return lastName;
    }
    public String getEmail(){
        return  email;
    }
    
    public String getPassword(){
        return password;
    }

    public String getPhone(){
        return  phoneNumber;
    }

    public String getAddress(){
        return homeAddress;
    }
    public LocalDateTime getDate(){
        return createdAt;
    }


    /*
        Setters and validations
    */

        public void setUserId(Long customerId){
            this.customerId = customerId;
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




}
