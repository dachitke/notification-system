package com.example.notificationsystem.service;

import com.example.notificationsystem.model.Notification;
import com.example.notificationsystem.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        notification.setSentAt(LocalDateTime.now());
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
}
