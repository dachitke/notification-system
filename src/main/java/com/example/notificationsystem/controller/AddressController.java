package com.example.notificationsystem.controller;

import com.example.notificationsystem.model.Address;
import com.example.notificationsystem.model.Customer;
import com.example.notificationsystem.repository.AddressRepository;
import com.example.notificationsystem.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Address>> getAddressesByCustomer(@PathVariable Long customerId) {
        return customerRepository.findById(customerId)
                .map(customer -> ResponseEntity.ok(customer.getAddresses()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/customer/{customerId}")
    public ResponseEntity<Address> addAddress(@PathVariable Long customerId, @RequestBody Address address) {
        return customerRepository.findById(customerId).map(customer -> {
            address.setCustomer(customer);
            Address saved = addressRepository.save(address);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long id, @RequestBody Address addressDetails) {
        return addressRepository.findById(id).map(address -> {
            address.setType(addressDetails.getType());
            address.setValue(addressDetails.getValue());
            Address updated = addressRepository.save(address);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteAddress(@PathVariable Long id) {
        return addressRepository.findById(id).map(address -> {
            addressRepository.delete(address);
            return ResponseEntity.noContent().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
