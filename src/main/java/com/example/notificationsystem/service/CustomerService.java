package com.example.notificationsystem.service;

import com.example.notificationsystem.model.Customer;
import com.example.notificationsystem.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer updatedCustomer) {
        return customerRepository.findById(id)
                .map(customer -> {
                    customer.setName(updatedCustomer.getName());
                    customer.setLastName(updatedCustomer.getLastName());
                    customer.setPhone(updatedCustomer.getPhone());
                    customer.setEmail(updatedCustomer.getEmail());
                    return customerRepository.save(customer);
                }).orElse(null);
    }

    public boolean deleteCustomer(Long id) {
        if (customerRepository.existsById(id)) {
            customerRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Batch update customers - updates all customers with an existing ID in the input list
    public List<Customer> batchUpdateCustomers(List<Customer> customers) {
        return customers.stream()
                .filter(c -> c.getId() != null)          // Only update customers with IDs
                .map(c -> updateCustomer(c.getId(), c))  // Reuse updateCustomer method
                .filter(Objects::nonNull)                 // Filter out not found customers
                .collect(Collectors.toList());
    }
}
