package com.example.notificationsystem.controller;

import com.example.notificationsystem.model.Customer;
import com.example.notificationsystem.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerRepository repository;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return repository.findAll();
    }

    @PostMapping
    public Customer createCustomer(@RequestBody Customer customer) {
        return repository.save(customer);
    }
}
