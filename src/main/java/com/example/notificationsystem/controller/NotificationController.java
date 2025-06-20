package com.example.notificationsystem.controller;

import com.example.notificationsystem.dto.PreferenceSummaryDTO;
import com.example.notificationsystem.model.Notification;
import com.example.notificationsystem.service.NotificationService;
import com.example.notificationsystem.repository.PreferenceRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @Autowired
    private PreferenceRepository preferenceRepository;

    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody Notification notification) {
        return ResponseEntity.ok(service.saveNotification(notification));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notification> updateNotificationStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        try {
            Notification updated = service.updateNotificationStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAll() {
        return ResponseEntity.ok(service.getAllNotifications());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Notification>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(service.getByStatus(status));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Notification>> getByCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(service.getByCustomerId(customerId));
    }

    @GetMapping("/report")
    public ResponseEntity<Map<String, Long>> getReport() {
        return ResponseEntity.ok(service.getDeliveryReport());
    }

    @GetMapping("/report/full")
    public ResponseEntity<Map<String, Object>> getFullReport() {
        return ResponseEntity.ok(service.getFullDeliveryReport());
    }

    // ✅ NEW: Preferences opt-in summary report
    @GetMapping("/preferences-summary")
    public ResponseEntity<PreferenceSummaryDTO> getPreferencesSummary() {
        return ResponseEntity.ok(preferenceRepository.getPreferenceSummary());
    }
}
