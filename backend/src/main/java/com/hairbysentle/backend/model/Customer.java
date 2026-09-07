package com.hairbysentle.backend.model;

import java.util.regex.Pattern;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.security.crypto.bcrypt.BCrypt;

@Entity
@Table(name = "Customer")
public class Customer {

    private static final Pattern VALID_PASSWORD_CHARS =
            Pattern.compile("^[A-Za-z0-9!@#$%^&*()_+\\-=]*$");

    private static final Pattern NO_SPECIAL_CHARS =
            Pattern.compile(".*[!@#$%^&*(),.?\":{}|<>].*");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CustomerID")
    private Long customerId;

    @NotBlank
    @Size(min = 2, max = 50)
    @Column(name = "FirstName", nullable = false)
    private String firstName;

    @NotBlank
    @Size(min = 2, max = 50)
    @Column(name = "LastName", nullable = false)
    private String lastName;

    @NotBlank
    @Email
    @Size(max = 100)
    @Column(name = "Email", nullable = false, unique = true)
    private String email;

    @Column(name = "Phone", length = 20)
    private String phone;

    @NotBlank
    @Size(max = 20)
    @Column(name = "PreferredContactMethod", nullable = false)
    private String preferredContactMethod;

    @NotBlank
    @Size(max = 255)
    @Column(name = "PasswordHash", nullable = false)
    private String passwordHash;

    public Customer() {
        // Required by JPA
    }

    public Customer(String firstName, String lastName, String email, String phone,
                     String preferredContactMethod, String rawPassword) {
        setFirstName(firstName);
        setLastName(lastName);
        setEmail(email);
        setPhone(phone);
        setPreferredContactMethod(preferredContactMethod);
        setPasswordHash(rawPassword);
    }

    // ---------------------------------------------------------------
    // Getters
    // ---------------------------------------------------------------

    public Long getCustomerId() {
        return customerId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getPreferredContactMethod() {
        return preferredContactMethod;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    // ---------------------------------------------------------------
    // Setters and validation
    // ---------------------------------------------------------------

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public void setFirstName(String firstName) {
        if (firstName == null || firstName.trim().isEmpty()) {
            throw new IllegalArgumentException("First name cannot be null or empty");
        }

        if (firstName.matches(".*\\d.*")) {
            throw new IllegalArgumentException("First name cannot contain numbers");
        }

        if (NO_SPECIAL_CHARS.matcher(firstName).matches()) {
            throw new IllegalArgumentException("First name cannot contain special characters");
        }

        if (firstName.matches(".*\\s{2,}.*")) {
            throw new IllegalArgumentException("First name cannot contain multiple consecutive spaces");
        }

        String cleanFirstName = firstName.trim();

        if (cleanFirstName.length() < 2 || cleanFirstName.length() > 50) {
            throw new IllegalArgumentException("First name must be between 2 and 50 characters");
        }

        this.firstName = cleanFirstName;
    }

    public void setLastName(String lastName) {
        if (lastName == null || lastName.trim().isEmpty()) {
            throw new IllegalArgumentException("Last name cannot be null or empty");
        }

        if (lastName.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Last name cannot contain numbers");
        }

        if (NO_SPECIAL_CHARS.matcher(lastName).matches()) {
            throw new IllegalArgumentException("Last name cannot contain special characters");
        }

        if (lastName.matches(".*\\s{2,}.*")) {
            throw new IllegalArgumentException("Last name cannot contain multiple consecutive spaces");
        }

        String cleanLastName = lastName.trim();

        if (cleanLastName.length() < 2 || cleanLastName.length() > 50) {
            throw new IllegalArgumentException("Last name must be between 2 and 50 characters");
        }

        this.lastName = cleanLastName;
    }

    public void setEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }

        String cleanEmail = email.trim();

        if (cleanEmail.length() > 100) {
            throw new IllegalArgumentException("Email must be less than or equal to 100 characters");
        }

        if (!cleanEmail.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new IllegalArgumentException("Invalid email format");
        }

        this.email = cleanEmail;
    }

    /**
     * Phone is optional to match the database schema (Phone VARCHAR(20), nullable).
     * If phone is provided, it must be exactly 10 digits.
     */
    public void setPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            this.phone = null;
            return;
        }

        String cleanPhone = phone.trim();

        if (!cleanPhone.matches("\\d{10}")) {
            throw new IllegalArgumentException("Phone number must be exactly 10 digits");
        }

        this.phone = cleanPhone;
    }

    public void setPreferredContactMethod(String preferredContactMethod) {
        if (preferredContactMethod == null || preferredContactMethod.trim().isEmpty()) {
            throw new IllegalArgumentException("Preferred contact method cannot be null or empty");
        }

        String cleanMethod = preferredContactMethod.trim();

        if (cleanMethod.length() > 20) {
            throw new IllegalArgumentException("Preferred contact method must be 20 characters or fewer");
        }

        this.preferredContactMethod = cleanMethod;
    }

    /**
     * Validates and hashes the raw password before storing it.
     * The stored value is always a BCrypt hash — never the raw password.
     */
    public void setPasswordHash(String rawPassword) {
        validatePassword(rawPassword);
        this.passwordHash = BCrypt.hashpw(rawPassword, BCrypt.gensalt());
    }

    private void validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty or only spaces");
        }
        if (password.length() < 6 || password.length() > 255) {
            throw new IllegalArgumentException("Password must be between 6 and 255 characters");
        }
        if (password.contains(" ")) {
            throw new IllegalArgumentException("Password cannot contain spaces");
        }
        if (!VALID_PASSWORD_CHARS.matcher(password).matches()) {
            throw new IllegalArgumentException("Password contains invalid characters");
        }

        boolean hasUppercase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowercase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);

        if (!hasUppercase || !hasLowercase || !hasDigit) {
            throw new IllegalArgumentException(
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            );
        }
    }

    /**
     * Verifies a raw (plaintext) password attempt against the stored hash.
     * Use this for login checks — never compare passwordHash directly.
     */
    public boolean checkPassword(String rawPassword) {
        if (rawPassword == null || this.passwordHash == null) {
            return false;
        }
        return BCrypt.checkpw(rawPassword, this.passwordHash);
    }

    // ---------------------------------------------------------------
    // equals / hashCode / toString
    // ---------------------------------------------------------------

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Customer)) return false;
        Customer other = (Customer) o;
        return customerId != null && customerId.equals(other.customerId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Customer{" +
                "customerId=" + customerId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", preferredContactMethod='" + preferredContactMethod + '\'' +
                '}';
    }
}