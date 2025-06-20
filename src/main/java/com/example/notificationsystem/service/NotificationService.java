package com.example.notificationsystem.service;

import com.example.notificationsystem.model.Notification;
import com.example.notificationsystem.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repository;

    public List<Notification> getAllNotifications() {
        return repository.findAll();
    }

    public List<Notification> getByStatus(String status) {
        return repository.findByStatus(status.toUpperCase());
    }

    public List<Notification> getByCustomerId(String customerId) {
        return repository.findByCustomerId(customerId);
    }

    public Notification saveNotification(Notification notification) {
        if (notification.getSentAt() == null) {
            notification.setSentAt(LocalDateTime.now());
        }
        return repository.save(notification);
    }

    public Map<String, Long> getDeliveryReport() {
        List<Object[]> data = repository.countByStatus();
        Map<String, Long> report = new HashMap<>();
        for (Object[] obj : data) {
            report.put((String) obj[0], (Long) obj[1]);
        }
        return report;
    }

    public Map<String, Object> getFullDeliveryReport() {
        Map<String, Object> report = new HashMap<>();

        List<Notification> all = getAllNotifications();

        long total = all.size();
        long delivered = all.stream().filter(n -> "DELIVERED".equalsIgnoreCase(n.getStatus())).count();
        long failed = all.stream().filter(n -> "FAILED".equalsIgnoreCase(n.getStatus())).count();
        long pending = all.stream().filter(n -> "PENDING".equalsIgnoreCase(n.getStatus())).count();

        report.put("total", total);
        report.put("delivered", delivered);
        report.put("failed", failed);
        report.put("pending", pending);
        report.put("details", all);

        return report;
    }
    public Notification updateNotificationStatus(Long id, String status) {
        Optional<Notification> notificationOpt = repository.findById(id);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setStatus(status.toUpperCase());
            notification.setSentAt(LocalDateTime.now());
            return repository.save(notification);
        }
        throw new RuntimeException("Notification not found with id: " + id);
    }


    public Optional<Notification> getNotificationById(Long id) {
        return repository.findById(id);
    }

    public void deleteNotification(Long id) {
        repository.deleteById(id);
    }

    public List<Notification> getFilteredNotifications(String status, String customerId) {
        List<Notification> all = repository.findAll();

        return all.stream()
                .filter(n -> status == null || n.getStatus().equalsIgnoreCase(status))
                .filter(n -> customerId == null || n.getCustomerId().equalsIgnoreCase(customerId))
                .toList();
    }
}
