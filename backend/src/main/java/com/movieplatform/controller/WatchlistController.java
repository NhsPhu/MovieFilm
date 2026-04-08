package com.movieplatform.controller;

import com.movieplatform.dto.watchlist.WatchlistItemDTO;
import com.movieplatform.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/watchlist")
public class WatchlistController {

    @Autowired
    private WatchlistService watchlistService;

    @GetMapping
    public ResponseEntity<List<WatchlistItemDTO>> getWatchlist(Authentication auth) {
        return ResponseEntity.ok(watchlistService.getWatchlist(auth.getName()));
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<Map<String, Object>> addToWatchlist(
            @PathVariable Long movieId,
            Authentication auth) {
        return ResponseEntity.ok(watchlistService.addToWatchlist(auth.getName(), movieId));
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<Map<String, Object>> removeFromWatchlist(
            @PathVariable Long movieId,
            Authentication auth) {
        return ResponseEntity.ok(watchlistService.removeFromWatchlist(auth.getName(), movieId));
    }

    @GetMapping("/check/{movieId}")
    public ResponseEntity<Map<String, Boolean>> checkInWatchlist(
            @PathVariable Long movieId,
            Authentication auth) {
        return ResponseEntity.ok(watchlistService.checkInWatchlist(auth.getName(), movieId));
    }
}
