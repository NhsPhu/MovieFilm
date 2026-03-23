package com.movieplatform.service;

import com.movieplatform.dto.user.ContactUpdateRequest;
import com.movieplatform.dto.user.SettingsRequest;
import com.movieplatform.entity.User;
import com.movieplatform.exception.ResourceNotFoundException;
import com.movieplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

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
        settings.setAutoPlayNext(user.getAutoPlayNext());
        settings.setPreviewOnHover(user.getPreviewOnHover());
        settings.setDefaultQuality(user.getDefaultQuality());

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
}
