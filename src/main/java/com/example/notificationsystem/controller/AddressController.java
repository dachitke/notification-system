package com.example.notificationsystem.controller;

import com.example.notificationsystem.model.Address;
import com.example.notificationsystem.model.Customer;
import com.example.notificationsystem.repository.CustomerRepository;
import com.example.notificationsystem.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

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
            Address saved = addressService.createAddress(address);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long id, @RequestBody Address addressDetails) {
        Address updated = addressService.updateAddress(id, addressDetails);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        if (addressService.deleteAddress(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/batch")
    public ResponseEntity<List<Address>> batchUpdateAddresses(@RequestBody List<Address> addresses) {
        List<Address> updatedAddresses = addressService.batchUpdateAddresses(addresses);
        return ResponseEntity.ok(updatedAddresses);
    }
}
