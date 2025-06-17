package com.example.notificationsystem.controller;

import com.example.notificationsystem.model.Admin;
import com.example.notificationsystem.repository.AdminRepository;
import com.example.notificationsystem.security.JwtResponse;
import com.example.notificationsystem.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    private final AdminRepository adminRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    public AdminController(AdminRepository adminRepository,
                           BCryptPasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Admin admin) {
        if (admin.getUsername() == null || admin.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username and password are required.");
        }

        if (adminRepository.findByUsername(admin.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists.");
        }

        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        Admin savedAdmin = adminRepository.save(admin);
        return ResponseEntity.ok(savedAdmin);
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Admin loginData) {
        if (loginData.getUsername() == null || loginData.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username and password are required.");
        }

        Optional<Admin> optionalAdmin = adminRepository.findByUsername(loginData.getUsername());

        if (optionalAdmin.isPresent()) {
            Admin admin = optionalAdmin.get();
            if (passwordEncoder.matches(loginData.getPassword(), admin.getPassword())) {
                String token = jwtUtil.generateToken(admin.getUsername());
                return ResponseEntity.ok(new JwtResponse(token));
            }
        }

        return ResponseEntity.status(401).body("Invalid username or password");
    }
}
