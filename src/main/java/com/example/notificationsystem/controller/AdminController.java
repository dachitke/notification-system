package com.example.notificationsystem.controller;

import com.example.notificationsystem.model.Admin;
import com.example.notificationsystem.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;


    // Create a new admin
    @PostMapping("/register")
    public ResponseEntity<Admin> register(@RequestBody Admin admin) {
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        return ResponseEntity.ok(adminRepository.save(admin));
    }

    // Admin login (basic)
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Admin loginData) {
        Optional<Admin> optionalAdmin = adminRepository.findByUsername(loginData.getUsername());
        if (optionalAdmin.isPresent()) {
            Admin admin = optionalAdmin.get();
            if (passwordEncoder.matches(loginData.getPassword(), admin.getPassword())) {
                return ResponseEntity.ok("Login successful");
            }
        }
        return ResponseEntity.status(401).body("Invalid username or password");
    }
}
