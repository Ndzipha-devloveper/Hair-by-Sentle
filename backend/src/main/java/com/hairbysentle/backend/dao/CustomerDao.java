package com.hairbysentle.backend.dao;

import com.hairbysentle.backend.model.Customer;

public interface CustomerDao {

    Customer findByEmail(String email);

    boolean existsByEmail(String email);

    Customer save(Customer customer);
}
