package com.movieplatform.controller;

import com.movieplatform.dto.admin.AdminStatsResponse;
import com.movieplatform.dto.admin.RecentActivityDTO;
import com.movieplatform.dto.movie.MovieDTO;
import com.movieplatform.service.AdminAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    @Autowired
    private AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminAnalyticsService.getDashboardStats());
    }

    @GetMapping("/recent-movies")
    public ResponseEntity<List<MovieDTO>> getRecentMovies() {
        return ResponseEntity.ok(adminAnalyticsService.getRecentMovies());
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<List<RecentActivityDTO>> getRecentActivities() {
        return ResponseEntity.ok(adminAnalyticsService.getRecentActivities());
    }
}
