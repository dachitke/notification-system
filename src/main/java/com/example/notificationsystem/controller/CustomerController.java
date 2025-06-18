package com.example.notificationsystem.controller;

import com.example.notificationsystem.model.Customer;
import com.example.notificationsystem.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        Customer saved = customerService.createCustomer(customer);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Optional<Customer>> updateCustomer(
            @PathVariable Long id,
            @RequestBody Customer updatedCustomer) {
        Optional<Customer> updated = Optional.ofNullable(customerService.updateCustomer(id, updatedCustomer));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        if (customerService.deleteCustomer(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/batch")
    public ResponseEntity<List<Customer>> batchUpdateCustomers(@RequestBody List<Customer> customers) {
        List<Customer> updatedCustomers = customerService.batchUpdateCustomers(customers);
        return ResponseEntity.ok(updatedCustomers);
    }

    // ✅ NEW: Search, filter, and sort customers
    @GetMapping("/search")
    public ResponseEntity<List<Customer>> searchCustomers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String channel,
            @RequestParam(required = false) Boolean smsOptIn,
            @RequestParam(required = false) Boolean emailOptIn,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String order
    ) {
        return ResponseEntity.ok(customerService.searchCustomers(
                name, lastName, email, channel, smsOptIn, emailOptIn, sortBy, order));
    }

}
