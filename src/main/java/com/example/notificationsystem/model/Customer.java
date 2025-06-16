package com.example.notificationsystem.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String lastName;
    private String email;
    private int phone;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Address> addresses = new ArrayList<>();

    public Customer() {}

    public Customer(String name, String lastName, String email, int phone) {
        this.name = name;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getLastName() { return lastName; }
    public int getPhone() { return phone; }
    public String getEmail() { return email; }
    public List<Address> getAddresses() { return addresses; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setPhone(int phone) { this.phone = phone; }
    public void setEmail(String email) { this.email = email; }
    public void setAddresses(List<Address> addresses) { this.addresses = addresses; }
}
