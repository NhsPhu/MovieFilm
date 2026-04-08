package com.movieplatform.dto.watchlist;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WatchlistItemDTO {
    private Long id;
    private Long movieId;
    private String movieTitle;
    private String posterUrl;
    private String backdropUrl;
    private Integer releaseYear;
    private Double avgRating;
    private Integer durationSec;
    private List<String> genres;
    private LocalDateTime addedAt;
}
