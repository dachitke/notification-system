package com.example.notificationsystem.repository;

import com.example.notificationsystem.model.Preference;
import com.example.notificationsystem.dto.PreferenceSummaryDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PreferenceRepository extends JpaRepository<Preference, Long> {

    Optional<Preference> findByCustomerId(Long customerId);

    @Query("SELECT new com.example.notificationsystem.dto.PreferenceSummaryDTO( " +
            "SUM(CASE WHEN p.emailOptIn = true THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN p.smsOptIn = true THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN p.promoOptIn = true THEN 1 ELSE 0 END)) " +
            "FROM Preference p")
    PreferenceSummaryDTO getPreferenceSummary();
}
