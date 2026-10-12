package com.hairbysentle.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hairbysentle.backend.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerCustomerId(Long customerId);
}
