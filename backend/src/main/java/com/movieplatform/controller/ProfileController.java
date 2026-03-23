package com.movieplatform.controller;

import com.movieplatform.dto.user.ContactUpdateRequest;
import com.movieplatform.dto.user.SettingsRequest;
import com.movieplatform.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(Authentication authentication) {
        String account = authentication.getName();
        profileService.requestOtp(account);
        return ResponseEntity.ok(Map.of("message", "OTP sent to your primary contact"));
    }

    @PutMapping("/contact")
    public ResponseEntity<?> updateContact(Authentication authentication, @Valid @RequestBody ContactUpdateRequest request) {
        String currentAccount = authentication.getName();
        profileService.updateContact(currentAccount, request);
        return ResponseEntity.ok(Map.of("message", "Contact updated successfully"));
    }

    @GetMapping("/settings")
    public ResponseEntity<SettingsRequest> getSettings(Authentication authentication) {
        String account = authentication.getName();
        return ResponseEntity.ok(profileService.getSettings(account));
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(Authentication authentication, @Valid @RequestBody SettingsRequest request) {
        String account = authentication.getName();
        profileService.updateSettings(account, request);
        return ResponseEntity.ok(Map.of("message", "Settings updated successfully"));
    }
}
