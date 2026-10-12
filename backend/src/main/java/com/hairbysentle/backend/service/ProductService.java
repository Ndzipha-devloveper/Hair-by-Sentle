package com.hairbysentle.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hairbysentle.backend.model.Product;
import com.hairbysentle.backend.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllActiveProducts() {
        return productRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    public Optional<Product> getActiveProductById(Long productId) {
        return productRepository.findByProductIdAndActiveTrue(productId);
    }
}
