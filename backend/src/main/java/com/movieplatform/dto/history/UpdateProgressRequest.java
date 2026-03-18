package com.movieplatform.dto.history;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateProgressRequest {

    @NotNull(message = "Movie ID is required")
    private Long movieId;

    @NotNull(message = "Current time is required")
    private Integer currentTime;

    private String device = "WEB";
}
