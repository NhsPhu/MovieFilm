package com.movieplatform.dto.movie;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieDTO {
    private Long id;
    private String title;
    private String description;
    private String posterUrl;
    private Integer releaseYear;
    private Integer durationSec;
    private Long viewsCount;
    private Double avgRating;
    private String status;
    private List<String> genres;
    private LocalDateTime createdAt;
}
