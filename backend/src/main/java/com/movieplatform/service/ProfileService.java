package com.movieplatform.service;

import com.movieplatform.dto.user.ContactUpdateRequest;
import com.movieplatform.dto.user.SettingsRequest;
import com.movieplatform.entity.User;
import com.movieplatform.exception.ResourceNotFoundException;
import com.movieplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.movieplatform.dto.auth.UpdateProfileRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Value("${app.storage.path:../storage}")
    private String storagePath;

    public void requestOtp(String account) {
        // In a real application, implement Email/SMS sending logic here.
        // For demonstration purposes, we assume OTP is always "123456"
    }

    public void updateContact(String currentAccount, ContactUpdateRequest request) {
        if (!"123456".equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        User user = userRepository.findByEmailOrPhoneNumber(currentAccount, currentAccount)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String newAccount = request.getNewAccount();
        boolean isEmail = newAccount.contains("@");

        if (isEmail && userRepository.existsByEmail(newAccount)) {
            throw new RuntimeException("Email already exists");
        } else if (!isEmail && userRepository.existsByPhoneNumber(newAccount)) {
            throw new RuntimeException("Phone number already exists");
        }

        if (isEmail) {
            user.setEmail(newAccount);
        } else {
            user.setPhoneNumber(newAccount);
        }

        userRepository.save(user);
    }

    public SettingsRequest getSettings(String account) {
        User user = userRepository.findByEmailOrPhoneNumber(account, account)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SettingsRequest settings = new SettingsRequest();
        settings.setAutoPlayNext(user.getAutoPlayNext() != null ? user.getAutoPlayNext() : true);
        settings.setPreviewOnHover(user.getPreviewOnHover() != null ? user.getPreviewOnHover() : true);
        settings.setDefaultQuality(user.getDefaultQuality() != null ? user.getDefaultQuality() : "1080p");

        return settings;
    }

    public void updateSettings(String account, SettingsRequest request) {
        User user = userRepository.findByEmailOrPhoneNumber(account, account)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setAutoPlayNext(request.getAutoPlayNext());
        user.setPreviewOnHover(request.getPreviewOnHover());
        user.setDefaultQuality(request.getDefaultQuality());

        userRepository.save(user);
    }

    public void updateBasicProfile(String account, UpdateProfileRequest request) {
        User user = userRepository.findByEmailOrPhoneNumber(account, account)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(request.getFullName());
        
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            boolean exists = userRepository.existsByPhoneNumber(request.getPhoneNumber());
            if (exists && (user.getPhoneNumber() == null || !user.getPhoneNumber().equals(request.getPhoneNumber()))) {
                throw new RuntimeException("Phone number already exists");
            }
            user.setPhoneNumber(request.getPhoneNumber());
        }

        userRepository.save(user);
    }

    public String uploadAvatar(String account, MultipartFile file) throws IOException {
        User user = userRepository.findByEmailOrPhoneNumber(account, account)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        Path avatarDirPath = Paths.get(storagePath, "avatars").toAbsolutePath().normalize();
        Files.createDirectories(avatarDirPath);

        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_");
        Path filePath = avatarDirPath.resolve(filename);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String avatarUrl = "/api/avatars/" + filename;
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        return avatarUrl;
    }
}
