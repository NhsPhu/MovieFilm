package com.movieplatform.controller;

import com.movieplatform.dto.rating.RatingDTO;
import com.movieplatform.dto.rating.RatingRequest;
import com.movieplatform.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movies")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @PostMapping("/{movieId}/rate")
    public ResponseEntity<RatingDTO> rateMovie(
            Authentication authentication,
            @PathVariable Long movieId,
            @Valid @RequestBody RatingRequest request) {
        String email = authentication.getName();
        RatingDTO rating = ratingService.rateMovie(email, movieId, request);
        return ResponseEntity.ok(rating);
    }

    @GetMapping("/{movieId}/ratings")
    public ResponseEntity<List<RatingDTO>> getMovieRatings(@PathVariable Long movieId) {
        List<RatingDTO> ratings = ratingService.getMovieRatings(movieId);
        return ResponseEntity.ok(ratings);
    }
}
