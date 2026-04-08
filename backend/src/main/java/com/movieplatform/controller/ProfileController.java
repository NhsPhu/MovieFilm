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
@RequestMapping("/users/profile")
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

    @PutMapping("/info")
    public ResponseEntity<?> updateBasicProfile(Authentication authentication, @Valid @RequestBody com.movieplatform.dto.auth.UpdateProfileRequest request) {
        String account = authentication.getName();
        profileService.updateBasicProfile(account, request);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(Authentication authentication, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String account = authentication.getName();
            String avatarUrl = profileService.uploadAvatar(account, file);
            return ResponseEntity.ok(Map.of("message", "Avatar uploaded successfully", "avatarUrl", avatarUrl));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
