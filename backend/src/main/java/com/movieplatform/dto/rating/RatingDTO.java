package com.movieplatform.dto.rating;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingDTO {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long movieId;
    private Integer score;
    private String review;
    private LocalDateTime createdAt;
}
