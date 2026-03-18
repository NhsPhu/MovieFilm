package com.movieplatform.service;

import com.movieplatform.dto.history.UpdateProgressRequest;
import com.movieplatform.dto.history.WatchHistoryDTO;
import com.movieplatform.entity.Movie;
import com.movieplatform.entity.User;
import com.movieplatform.entity.WatchHistory;
import com.movieplatform.exception.ResourceNotFoundException;
import com.movieplatform.repository.MovieRepository;
import com.movieplatform.repository.UserRepository;
import com.movieplatform.repository.WatchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchHistoryService {

    @Autowired
    private WatchHistoryRepository watchHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Transactional
    public WatchHistoryDTO updateProgress(String email, UpdateProgressRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));

        WatchHistory history = watchHistoryRepository
                .findByUserIdAndMovieId(user.getId(), movie.getId())
                .orElse(new WatchHistory());

        boolean shouldSave = false;
        
        // Throttling: only update if time difference is >= 10s, or if the movie is completed
        if (history.getId() == null || 
            Math.abs(request.getCurrentTime() - history.getCurrentTimeSec()) >= 10) {
            shouldSave = true;
        }

        history.setUser(user);
        history.setMovie(movie);
        history.setCurrentTimeSec(request.getCurrentTime());
        history.setLastWatchedAt(LocalDateTime.now());

        WatchHistory.DeviceType deviceType;
        try {
            deviceType = WatchHistory.DeviceType.valueOf(request.getDevice().toUpperCase());
        } catch (IllegalArgumentException e) {
            deviceType = WatchHistory.DeviceType.WEB;
        }
        history.setDeviceType(deviceType);

        if (movie.getDurationSec() != null && request.getCurrentTime() >= movie.getDurationSec() * 0.95) {
            if (!Boolean.TRUE.equals(history.getIsFinished())) {
                shouldSave = true; // force save if status changes
            }
            history.setIsFinished(true);
        }

        if (shouldSave) {
            WatchHistory saved = watchHistoryRepository.save(history);
            return convertToDTO(saved);
        }

        return convertToDTO(history);

    }

    public List<WatchHistoryDTO> getUserHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<WatchHistory> histories = watchHistoryRepository
                .findByUserIdOrderByLastWatchedAtDesc(user.getId());

        return histories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public WatchHistoryDTO getMovieProgress(String email, Long movieId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WatchHistory history = watchHistoryRepository
                .findByUserIdAndMovieId(user.getId(), movieId)
                .orElse(null);

        if (history == null) {
            return null;
        }

        return convertToDTO(history);
    }

    private WatchHistoryDTO convertToDTO(WatchHistory history) {
        WatchHistoryDTO dto = new WatchHistoryDTO();
        dto.setId(history.getId());
        dto.setMovieId(history.getMovie().getId());
        dto.setMovieTitle(history.getMovie().getTitle());
        dto.setPosterUrl(history.getMovie().getPosterUrl());
        dto.setCurrentTimeSec(history.getCurrentTimeSec());
        dto.setIsFinished(history.getIsFinished());
        dto.setLastWatchedAt(history.getLastWatchedAt());
        dto.setDeviceType(history.getDeviceType().name());
        return dto;
    }
}
