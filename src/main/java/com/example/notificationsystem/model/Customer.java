package com.example.notificationsystem.model;

import com.example.notificationsystem.model.Customer;
import jakarta.persistence.*;

@Entity
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;


    public Customer() {}

    public Customer(String name, String email) {
        this.name = name;
        this.email = email;
    }


    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
}
