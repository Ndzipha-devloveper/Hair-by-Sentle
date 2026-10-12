package com.hairbysentle.backend.service;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.hairbysentle.backend.model.Product;
import com.hairbysentle.backend.repository.ProductRepository;

class ProductServiceTest {

    @Test
    void getAllActiveProducts_shouldReturnEnabledProducts() {
        ProductRepository productRepository = mock(ProductRepository.class);
        ProductService productService = new ProductService(productRepository);

        Product product = new Product();
        product.setName("Brazilian Body Wave");
        product.setPrice(1450.00);
        product.setCategory("weave");
        product.setActive(true);

        when(productRepository.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(product));

        List<Product> result = productService.getAllActiveProducts();

        assertEquals(1, result.size());
        assertEquals("Brazilian Body Wave", result.get(0).getName());
    }
}
