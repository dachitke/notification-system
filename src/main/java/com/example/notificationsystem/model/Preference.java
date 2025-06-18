package com.example.notificationsystem.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class Preference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean smsOptIn;
    private boolean emailOptIn;
    private boolean promoOptIn;

    @OneToOne
    @JoinColumn(name = "customer_id", unique = true)
    @JsonBackReference
    private Customer customer;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isSmsOptIn() {
        return smsOptIn;
    }

    public void setSmsOptIn(boolean smsOptIn) {
        this.smsOptIn = smsOptIn;
    }

    public boolean isEmailOptIn() {
        return emailOptIn;
    }

    public void setEmailOptIn(boolean emailOptIn) {
        this.emailOptIn = emailOptIn;
    }

    public boolean isPromoOptIn() {
        return promoOptIn;
    }

    public void setPromoOptIn(boolean promoOptIn) {
        this.promoOptIn = promoOptIn;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public String getPreferredChannel() {
        if (smsOptIn) {
            return "SMS";
        } else if (emailOptIn) {
            return "Email";
        } else if (promoOptIn) {
            return "Promotional";
        } else {
            return "None";
        }
    }
}
