package com.hairbysentle.backend.dao;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.hairbysentle.backend.model.PendingRegistration;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
public class PendingRegistrationDaoImpl implements PendingRegistrationDao {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public PendingRegistration findByEmail(String email) {
        return entityManager.createQuery(
                "select registration from PendingRegistration registration where registration.email = :email",
                PendingRegistration.class)
            .setParameter("email", email)
            .getResultStream()
            .findFirst()
            .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public PendingRegistration findByTokenHash(String tokenHash) {
        return entityManager.createQuery(
                "select registration from PendingRegistration registration where registration.tokenHash = :tokenHash",
                PendingRegistration.class)
            .setParameter("tokenHash", tokenHash)
            .getResultStream()
            .findFirst()
            .orElse(null);
    }

    @Override
    @Transactional
    public PendingRegistration save(PendingRegistration registration) {
        entityManager.persist(registration);
        return registration;
    }

    @Override
    @Transactional
    public void delete(PendingRegistration registration) {
        entityManager.remove(entityManager.contains(registration)
                ? registration : entityManager.merge(registration));
    }
}