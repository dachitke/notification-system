package com.example.notificationsystem.service;

import com.example.notificationsystem.model.Customer;
import com.example.notificationsystem.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
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

    public List<Customer> batchUpdateCustomers(List<Customer> customers) {
        return customers.stream()
                .filter(c -> c.getId() != null)
                .map(c -> updateCustomer(c.getId(), c))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }



    private Comparator<Customer> getComparator(String sortBy, String sortOrder) {
        Comparator<Customer> comparator;

        switch (sortBy.toLowerCase()) {
            case "name" -> comparator = Comparator.comparing(Customer::getName, String.CASE_INSENSITIVE_ORDER);
            case "lastname" -> comparator = Comparator.comparing(Customer::getLastName, String.CASE_INSENSITIVE_ORDER);
            case "email" -> comparator = Comparator.comparing(Customer::getEmail, String.CASE_INSENSITIVE_ORDER);
            case "id" -> comparator = Comparator.comparing(Customer::getId);
            default -> comparator = Comparator.comparing(Customer::getId); // fallback
        }

        if ("desc".equalsIgnoreCase(sortOrder)) {
            comparator = comparator.reversed();
        }

        return comparator;
    }

    public List<Customer> searchCustomers(
            String name,
            String lastName,
            String email,
            String preferredChannel,
            Boolean smsOptIn,
            Boolean emailOptIn,
            String sortBy,
            String sortOrder) {

        List<Customer> customers = customerRepository.findAll();

        return customers.stream()
                .filter(c -> name == null || c.getName().toLowerCase().contains(name.toLowerCase()))
                .filter(c -> lastName == null || c.getLastName().toLowerCase().contains(lastName.toLowerCase()))
                .filter(c -> email == null || c.getEmail().toLowerCase().contains(email.toLowerCase()))
                .filter(c -> preferredChannel == null || (
                        c.getPreference() != null &&
                                preferredChannel.equalsIgnoreCase(c.getPreference().getPreferredChannel())
                ))
                .filter(c -> smsOptIn == null || (
                        c.getPreference() != null &&
                                c.getPreference().isSmsOptIn() == smsOptIn
                ))
                .filter(c -> emailOptIn == null || (
                        c.getPreference() != null &&
                                c.getPreference().isEmailOptIn() == emailOptIn
                ))
                .sorted(getComparator(sortBy, sortOrder))
                .collect(Collectors.toList());
    }

}
