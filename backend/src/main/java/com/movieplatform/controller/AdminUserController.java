package com.movieplatform.controller;

import com.movieplatform.entity.User;
import com.movieplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        // In a real production app, we should use a UserDTO to hide passwordHash.
        // For simplicity, we just fetch them. But wait, it's safer to map to DTO.
        // I will map to an anonymous DTO or use projection.
        List<User> users = userRepository.findAll();
        // Since User entity contains passwordHash, let's nullify it before sending
        users.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
}
