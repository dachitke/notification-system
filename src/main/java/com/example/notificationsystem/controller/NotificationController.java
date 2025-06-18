package com.example.notificationsystem.controller;

import com.example.notificationsystem.model.Notification;
import com.example.notificationsystem.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = { "http://127.0.0.1:5500", "http://localhost:5500" }, allowCredentials = "true")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    @Autowired
    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Notification> create(@RequestBody Notification notification) {
        return ResponseEntity.ok(service.saveNotification(notification));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Notification>> getAllFiltered(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String customerId
    ) {
        return ResponseEntity.ok(service.getFilteredNotifications(status, customerId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Notification>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(service.getByStatus(status));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Notification>> getByCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(service.getByCustomerId(customerId));
    }

    @GetMapping("/report")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getReport() {
        return ResponseEntity.ok(service.getDeliveryReport());
    }

    @GetMapping("/report/full")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getFullReport() {
        return ResponseEntity.ok(service.getFullDeliveryReport());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<Notification> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return service.getNotificationById(id).map(notification -> {
            notification.setStatus(status.toUpperCase());
            if ("DELIVERED".equalsIgnoreCase(status)) {
                notification.setDeliveredAt(LocalDateTime.now());
            }
            service.saveNotification(notification);
            return ResponseEntity.ok(notification);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        Optional<Notification> notificationOpt = service.getNotificationById(id);

        if (notificationOpt.isPresent()) {
            service.deleteNotification(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
