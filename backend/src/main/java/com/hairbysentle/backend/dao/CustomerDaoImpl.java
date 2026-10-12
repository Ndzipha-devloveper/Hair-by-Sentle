package com.hairbysentle.backend.dao;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.hairbysentle.backend.model.Customer;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
public class CustomerDaoImpl implements CustomerDao {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public Customer findByEmail(String email) {
        return entityManager.createQuery(
                "select customer from Customer customer where customer.email = :email",
                Customer.class)
            .setParameter("email", email)
            .getResultStream()
            .findFirst()
            .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        Long count = entityManager.createQuery(
                "select count(customer) from Customer customer where customer.email = :email",
                Long.class)
            .setParameter("email", email)
            .getSingleResult();
        return count > 0;
    }

    @Override
    @Transactional
    public Customer save(Customer customer) {
        if (customer.getCustomerId() == null) {
            entityManager.persist(customer);
            return customer;
        }
        return entityManager.merge(customer);
    }
}
