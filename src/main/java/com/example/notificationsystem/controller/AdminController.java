package com.example.notificationsystem.controller;

import com.example.notificationsystem.model.Admin;
import com.example.notificationsystem.repository.AdminRepository;
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
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public AdminController(AdminRepository adminRepository, JwtUtil jwtUtil, BCryptPasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Admin loginRequest) {
        Optional<Admin> adminOpt = adminRepository.findByUsername(loginRequest.getUsername());

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();

            if (passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword())) {
                String token = jwtUtil.generateToken(admin.getUsername(), admin.getRole());
                return ResponseEntity.ok(new JwtResponse(token));
            }
        }
        return ResponseEntity.status(401).body("Invalid username or password");
    }

    // DTO for response
    public static class JwtResponse {
        private final String token;
        public JwtResponse(String token) { this.token = token; }
        public String getToken() { return token; }
    }
}
