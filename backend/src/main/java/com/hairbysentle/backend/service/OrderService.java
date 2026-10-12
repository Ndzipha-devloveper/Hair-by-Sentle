package com.hairbysentle.backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.hairbysentle.backend.dao.CustomerDao;
import com.hairbysentle.backend.dto.CheckoutItemRequest;
import com.hairbysentle.backend.dto.CheckoutRequest;
import com.hairbysentle.backend.model.Customer;
import com.hairbysentle.backend.model.Order;
import com.hairbysentle.backend.model.OrderItem;
import com.hairbysentle.backend.model.Product;
import com.hairbysentle.backend.repository.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final CustomerDao customerDao;

    public OrderService(OrderRepository orderRepository,
                       ProductService productService,
                       CustomerDao customerDao) {
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.customerDao = customerDao;
    }

    public Order checkout(CheckoutRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Checkout request is required");
        }
        if (request.customerEmail == null || request.customerEmail.isBlank()) {
            throw new IllegalArgumentException("Customer email is required");
        }
        if (request.items == null || request.items.isEmpty()) {
            throw new IllegalArgumentException("Cart items are required");
        }

        Customer customer = customerDao.findByEmail(request.customerEmail.trim());
        if (customer == null) {
            throw new IllegalArgumentException("User not found");
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus("PENDING");

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CheckoutItemRequest itemRequest : request.items) {
            if (itemRequest == null || itemRequest.productId == null || itemRequest.quantity == null || itemRequest.quantity <= 0) {
                throw new IllegalArgumentException("Each cart item must contain a valid product ID and quantity");
            }

            Product product = productService.getActiveProductById(itemRequest.productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemRequest.productId));

            BigDecimal unitPrice = BigDecimal.valueOf(product.getPrice());
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.quantity));
            total = total.add(lineTotal);

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.quantity);
            item.setUnitPrice(unitPrice);
            orderItems.add(item);
        }

        order.setItems(orderItems);
        for (OrderItem item : orderItems) {
            order.addItem(item);
        }
        order.setTotalAmount(total);
        return orderRepository.save(order);
    }
}
