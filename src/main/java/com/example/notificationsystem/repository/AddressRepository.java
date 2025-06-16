package com.example.notificationsystem.repository;

import com.example.notificationsystem.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {
    // You can add custom queries if needed
}
