package com.movieplatform.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContactUpdateRequest {

    @NotBlank(message = "New Email or Phone Number is required")
    private String newAccount;

    @NotBlank(message = "OTP is required")
    private String otp;
}
