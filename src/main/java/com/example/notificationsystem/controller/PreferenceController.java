package com.example.notificationsystem.controller;

import com.example.notificationsystem.model.Preference;
import com.example.notificationsystem.service.PreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")  // base path
public class PreferenceController {

    private final PreferenceService preferenceService;

    public PreferenceController(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    @GetMapping("/test")
    public String test() {
        return "Preferences API is working";
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

    // Create or update preference for a customer using POST
    @PostMapping("/customer/{customerId}")
    public ResponseEntity<Preference> createOrUpdatePreferences(
            @PathVariable Long customerId,
            @RequestBody Preference preference) {
        try {
            Preference updatedPrefs = preferenceService.updatePreferences(customerId, preference);
            return ResponseEntity.ok(updatedPrefs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Update preference for a customer using PUT
    @PutMapping("/customer/{customerId}")
    public ResponseEntity<Preference> updatePreferencesPut(
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
