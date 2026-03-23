package com.movieplatform.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SettingsRequest {

    @NotNull
    private Boolean autoPlayNext;

    @NotNull
    private Boolean previewOnHover;

    @NotBlank
    private String defaultQuality;
}
