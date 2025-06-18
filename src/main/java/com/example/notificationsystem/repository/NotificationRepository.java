package com.example.notificationsystem.repository;

import com.example.notificationsystem.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface NotificationRepository extends JpaRepository<Notification, Long> {


    List<Notification> findByStatus(String status);


    List<Notification> findByCustomerId(String customerId);


    @Query("SELECT n.status, COUNT(n) FROM Notification n GROUP BY n.status")
    List<Object[]> countByStatus();
}
