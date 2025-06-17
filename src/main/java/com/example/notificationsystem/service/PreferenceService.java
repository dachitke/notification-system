package com.example.notificationsystem.service;

import com.example.notificationsystem.model.Customer;
import com.example.notificationsystem.model.Preference;
import com.example.notificationsystem.repository.CustomerRepository;
import com.example.notificationsystem.repository.PreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PreferenceService {

    @Autowired
    private PreferenceRepository preferenceRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public Preference getPreferencesByCustomerId(Long customerId) {
        return preferenceRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Preferences not found"));
    }

    public Preference updatePreferences(Long customerId, Preference newPrefs) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Preference pref = preferenceRepository.findByCustomerId(customerId)
                .orElse(new Preference());

        pref.setCustomer(customer);
        pref.setSmsOptIn(newPrefs.isSmsOptIn());
        pref.setEmailOptIn(newPrefs.isEmailOptIn());
        pref.setPromoOptIn(newPrefs.isPromoOptIn());

        return preferenceRepository.save(pref);
    }
}
