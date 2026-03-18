package com.movieplatform.dto.history;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WatchHistoryDTO {
    private Long id;
    private Long movieId;
    private String movieTitle;
    private String posterUrl;
    private Integer currentTimeSec;
    private Boolean isFinished;
    private LocalDateTime lastWatchedAt;
    private String deviceType;
}
