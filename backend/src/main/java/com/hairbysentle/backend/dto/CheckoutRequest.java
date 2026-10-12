package com.hairbysentle.backend.dto;

import java.util.List;

public class CheckoutRequest {

    public String customerEmail;
    public List<CheckoutItemRequest> items;

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public List<CheckoutItemRequest> getItems() {
        return items;
    }

    public void setItems(List<CheckoutItemRequest> items) {
        this.items = items;
    }
}
