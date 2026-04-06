package com.movieplatform.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private Long totalUsers;
    private Long totalMovies;
    private Long totalViews;
    private Long activeNow;
    
    // Optional: add trend percentages if backend calculates it, 
    // for now we set them to "+0%" or similar in the frontend or DB.
}
