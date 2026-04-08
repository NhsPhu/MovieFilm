package com.movieplatform.service;

import com.movieplatform.config.JwtTokenProvider;
import com.movieplatform.dto.auth.AuthResponse;
import com.movieplatform.dto.auth.LoginRequest;
import com.movieplatform.dto.auth.RegisterRequest;
import com.movieplatform.dto.auth.UserDTO;
import com.movieplatform.entity.User;
import com.movieplatform.exception.ResourceNotFoundException;
import com.movieplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        String account = request.getAccount();
        boolean isEmail = account.contains("@");

        if (isEmail && userRepository.existsByEmail(account)) {
            throw new RuntimeException("Email already exists");
        } else if (!isEmail && userRepository.existsByPhoneNumber(account)) {
            throw new RuntimeException("Phone number already exists");
        }

        User user = new User();
        if (isEmail) {
            user.setEmail(account);
        } else {
            user.setPhoneNumber(account);
        }
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(User.UserRole.USER);
        user.setIsActive(true);

        userRepository.save(user);

        String principal = isEmail ? user.getEmail() : user.getPhoneNumber();
        String token = tokenProvider.generateTokenFromEmail(principal, user.getRole().name());

        return new AuthResponse(
                token,
                principal,
                user.getFullName(),
                user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        String account = request.getAccount();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(account, request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmailOrPhoneNumber(account, account)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = tokenProvider.generateToken(authentication, user.getRole().name());
        String principal = user.getEmail() != null ? user.getEmail() : user.getPhoneNumber();

        return new AuthResponse(
                token,
                principal,
                user.getFullName(),
                user.getRole().name());
    }

    public UserDTO getCurrentUser(String account) {
        User user = userRepository.findByEmailOrPhoneNumber(account, account)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String principal = user.getEmail() != null ? user.getEmail() : user.getPhoneNumber();
        return new UserDTO(
                user.getId(),
                principal,
                user.getFullName(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.getIsActive(),
                user.getAvatarUrl(),
                user.getMembershipRank().name(),
                user.getCreatedAt());
    }

    public void changePassword(String account, String oldPassword, String newPassword) {
        User user = userRepository.findByEmailOrPhoneNumber(account, account)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("Invalid old password");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
