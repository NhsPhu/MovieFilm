package com.movieplatform.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String role;
    private Boolean isActive;
    private String avatarUrl;
    private String membershipRank;
    private java.time.LocalDateTime createdAt;
}
