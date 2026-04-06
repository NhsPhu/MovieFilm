package com.movieplatform.service;

import com.movieplatform.dto.admin.AdminStatsResponse;
import com.movieplatform.dto.admin.RecentActivityDTO;
import com.movieplatform.dto.movie.MovieDTO;
import com.movieplatform.entity.Genre;
import com.movieplatform.entity.Movie;
import com.movieplatform.repository.MovieRepository;
import com.movieplatform.repository.UserRepository;
import com.movieplatform.repository.WatchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminAnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private WatchHistoryRepository watchHistoryRepository;

    public AdminStatsResponse getDashboardStats() {
        Long totalUsers = userRepository.count();
        Long totalMovies = movieRepository.countByStatus(Movie.ProcessingStatus.READY);
        if (totalMovies == null) totalMovies = 0L;
        
        Long totalViews = movieRepository.sumViewsCount();
        if (totalViews == null) totalViews = 0L;

        // Count users active within the last 24 hours
        Long activeNow = watchHistoryRepository.countByLastWatchedAtAfter(LocalDateTime.now().minusHours(24));
        if (activeNow == null) activeNow = 0L;
        
        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalMovies(totalMovies)
                .totalViews(totalViews)
                .activeNow(activeNow)
                .build();
    }

    public List<MovieDTO> getRecentMovies() {
        return movieRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RecentActivityDTO> getRecentActivities() {
        return watchHistoryRepository.findTop5ByOrderByLastWatchedAtDesc()
                .stream()
                .map(wh -> RecentActivityDTO.builder()
                        .userFullName(wh.getUser().getFullName() != null ? wh.getUser().getFullName() : wh.getUser().getEmail())
                        .movieTitle(wh.getMovie().getTitle())
                        .time(wh.getLastWatchedAt())
                        .action("Đã xem phim")
                        .build())
                .collect(Collectors.toList());
    }

    private MovieDTO convertToDTO(Movie movie) {
        List<String> genreNames = movie.getGenres().stream()
                .map(Genre::getName)
                .collect(Collectors.toList());

        return new MovieDTO(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getPosterUrl(),
                movie.getReleaseYear(),
                movie.getDurationSec(),
                movie.getViewsCount(),
                movie.getAvgRating(),
                movie.getStatus().name(),
                genreNames,
                movie.getCreatedAt());
    }
}
