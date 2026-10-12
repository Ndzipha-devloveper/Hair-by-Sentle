package com.hairbysentle.backend.dao;

import com.hairbysentle.backend.model.PendingRegistration;

public interface PendingRegistrationDao {

    PendingRegistration findByEmail(String email);

    PendingRegistration findByTokenHash(String tokenHash);

    PendingRegistration save(PendingRegistration registration);

    void delete(PendingRegistration registration);
}