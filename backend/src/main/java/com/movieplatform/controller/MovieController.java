package com.movieplatform.controller;

import com.movieplatform.dto.movie.MovieDTO;
import com.movieplatform.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movies")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @GetMapping
    public ResponseEntity<Page<MovieDTO>> getAllMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean readyOnly) {

        Page<MovieDTO> movies = readyOnly ? movieService.getReadyMovies(page, size)
                : movieService.getAllMovies(page, size);

        return ResponseEntity.ok(movies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieDTO> getMovieById(@PathVariable Long id) {
        MovieDTO movie = movieService.getMovieById(id);
        return ResponseEntity.ok(movie);
    }

    @GetMapping("/popular")
    public ResponseEntity<List<MovieDTO>> getPopularMovies(
            @RequestParam(defaultValue = "10") int limit) {
        List<MovieDTO> movies = movieService.getPopularMovies(limit);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/genre/{genreId}")
    public ResponseEntity<List<MovieDTO>> getMoviesByGenre(
            @PathVariable Integer genreId,
            @RequestParam(defaultValue = "10") int limit) {
        List<MovieDTO> movies = movieService.getMoviesByGenre(genreId, limit);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<MovieDTO>> searchMovies(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<MovieDTO> movies = movieService.searchMovies(q, page, size);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<MovieDTO>> filterMovies(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer genreId,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "newest") String sortBy) {
            
        Page<MovieDTO> movies = movieService.searchAndFilterMovies(q, genreId, year, page, size, sortBy);
        return ResponseEntity.ok(movies);
    }
}
