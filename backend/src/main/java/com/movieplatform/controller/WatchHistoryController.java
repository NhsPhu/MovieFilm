package com.movieplatform.controller;

import com.movieplatform.dto.history.UpdateProgressRequest;
import com.movieplatform.dto.history.WatchHistoryDTO;
import com.movieplatform.service.WatchHistoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/history")
public class WatchHistoryController {

    @Autowired
    private WatchHistoryService watchHistoryService;

    @PostMapping
    public ResponseEntity<WatchHistoryDTO> updateProgress(
            Authentication authentication,
            @Valid @RequestBody UpdateProgressRequest request) {
        String email = authentication.getName();
        WatchHistoryDTO history = watchHistoryService.updateProgress(email, request);
        return ResponseEntity.ok(history);
    }

    @GetMapping
    public ResponseEntity<List<WatchHistoryDTO>> getUserHistory(Authentication authentication) {
        String email = authentication.getName();
        List<WatchHistoryDTO> histories = watchHistoryService.getUserHistory(email);
        return ResponseEntity.ok(histories);
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<WatchHistoryDTO> getMovieProgress(
            Authentication authentication,
            @PathVariable Long movieId) {
        String email = authentication.getName();
        WatchHistoryDTO history = watchHistoryService.getMovieProgress(email, movieId);

        if (history == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(history);
    }
}
