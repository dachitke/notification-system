package com.example.notificationsystem.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private String value;


    private String street;
    private String city;

    private String country;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    @JsonBackReference
    private Customer customer;

    public Address() {}

    public Address(String type, String value, Customer customer) {
        this.type = type;
        this.value = value;
        this.customer = customer;
    }



    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getValue() {
        return value;
    }

    public String getStreet() {
        return street;
    }

    public String getCity() {
        return city;
    }





    public String getCountry() {
        return country;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public void setCity(String city) {
        this.city = city;
    }


    public void setCountry(String country) {
        this.country = country;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
}
