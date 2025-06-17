package com.example.notificationsystem.controller;

import com.example.notificationsystem.model.Preference;
import com.example.notificationsystem.service.PreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/preferences")
public class PreferenceController {

    private final PreferenceService preferenceService;

    public PreferenceController(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    // Get preference by customer ID
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<Preference> getPreferencesByCustomerId(@PathVariable Long customerId) {
        try {
            Preference prefs = preferenceService.getPreferencesByCustomerId(customerId);
            return ResponseEntity.ok(prefs);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Create or update preference for a customer
    @PostMapping("/customer/{customerId}")
    public ResponseEntity<Preference> updatePreferences(
            @PathVariable Long customerId,
            @RequestBody Preference preference) {
        try {
            Preference updatedPrefs = preferenceService.updatePreferences(customerId, preference);
            return ResponseEntity.ok(updatedPrefs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
