package com.movieplatform.controller;

import com.movieplatform.dto.movie.CreateMovieRequest;
import com.movieplatform.dto.movie.MovieDTO;
import com.movieplatform.service.MovieService;
import com.movieplatform.service.VideoTranscodingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/movies")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMovieController {

    @Autowired
    private MovieService movieService;

    @Autowired
    private VideoTranscodingService videoTranscodingService;

    @PostMapping
    public ResponseEntity<MovieDTO> createMovie(@Valid @RequestBody CreateMovieRequest request) {
        MovieDTO movie = movieService.createMovie(request);
        return new ResponseEntity<>(movie, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovieDTO> updateMovie(
            @PathVariable Long id,
            @Valid @RequestBody CreateMovieRequest request) {
        MovieDTO movie = movieService.updateMovie(id, request);
        return ResponseEntity.ok(movie);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<java.util.Map<String, Integer>> getTranscodingProgress(@PathVariable Long id) {
        Integer progress = videoTranscodingService.getProgress(id);
        return ResponseEntity.ok(java.util.Map.of("progress", progress));
    }
}
