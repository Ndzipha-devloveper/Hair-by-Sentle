package com.hairbysentle.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hairbysentle.backend.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrueOrderByCreatedAtDesc();

    Optional<Product> findByProductIdAndActiveTrue(Long productId);
}
