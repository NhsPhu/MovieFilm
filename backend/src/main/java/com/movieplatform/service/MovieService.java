package com.movieplatform.service;

import com.movieplatform.dto.movie.CreateMovieRequest;
import com.movieplatform.dto.movie.MovieDTO;
import com.movieplatform.entity.Genre;
import com.movieplatform.entity.Movie;
import com.movieplatform.exception.ResourceNotFoundException;
import com.movieplatform.repository.GenreRepository;
import com.movieplatform.repository.MovieRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private static final Logger logger = LoggerFactory.getLogger(MovieService.class);

    @Value("${ai.service.url:http://ai-service:8001}")
    private String aiServiceUrl;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Transactional
    @CacheEvict(value = {"movies", "popularMovies"}, allEntries = true)
    public MovieDTO createMovie(CreateMovieRequest request) {
        Movie movie = new Movie();
        movie.setTitle(request.getTitle());
        movie.setDescription(request.getDescription());
        movie.setPosterUrl(request.getPosterUrl());
        movie.setBackdropUrl(request.getBackdropUrl());
        movie.setTrailerUrl(request.getTrailerUrl());
        movie.setReleaseYear(request.getReleaseYear());
        movie.setDurationSec(request.getDurationSec());
        movie.setDirector(request.getDirector());
        movie.setCast(request.getCast());
        movie.setLanguage(request.getLanguage() != null ? request.getLanguage() : "Tiếng Việt");
        movie.setAgeRating(request.getAgeRating() != null ? request.getAgeRating() : "T18");
        movie.setStatus(Movie.ProcessingStatus.PROCESSING);

        String folderPath = "movies/" + UUID.randomUUID().toString();
        movie.setFolderPath(folderPath);

        Set<Genre> genres = new HashSet<>();
        if (request.getGenreIds() != null) {
            for (Integer genreId : request.getGenreIds()) {
                Genre genre = genreRepository.findById(genreId)
                        .orElseThrow(() -> new ResourceNotFoundException("Genre not found"));
                genres.add(genre);
            }
        }
        movie.setGenres(genres);

        Movie savedMovie = movieRepository.save(movie);
        return convertToDTO(savedMovie);
    }

    public Page<MovieDTO> getAllMovies(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Movie> movies = movieRepository.findAll(pageable);
        return movies.map(this::convertToDTO);
    }

    public Page<MovieDTO> getReadyMovies(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return movieRepository.findByStatus(Movie.ProcessingStatus.READY, pageable)
                .map(this::convertToDTO);
    }

    @Cacheable(value = "movies", key = "#id")
    public MovieDTO getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));

        // Increment views — do it outside cache
        return convertToDTO(movie);
    }

    @Transactional
    public MovieDTO getMovieByIdAndIncrementViews(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
        // Use modifying query to avoid race condition
        movieRepository.incrementViewsCount(id);
        movie.setViewsCount(movie.getViewsCount() + 1);
        return convertToDTO(movie);
    }

    @Cacheable(value = "popularMovies", key = "#limit")
    public List<MovieDTO> getPopularMovies(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return movieRepository.findPopularMovies(pageable)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<MovieDTO> getMoviesByGenre(Integer genreId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return movieRepository.findByGenreIds(List.of(genreId), pageable)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<MovieDTO> searchMovies(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return movieRepository.searchByTitle(query, pageable).map(this::convertToDTO);
    }

    public Page<MovieDTO> searchAndFilterMovies(String query, Integer genreId, Integer year, int page, int size, String sortBy) {
        Sort.Direction direction = Sort.Direction.DESC;
        String sortProperty = "createdAt";

        if (sortBy != null && !sortBy.trim().isEmpty()) {
            switch (sortBy.toLowerCase()) {
                case "rating":
                    sortProperty = "avgRating";
                    break;
                case "year":
                    sortProperty = "releaseYear";
                    break;
                case "views":
                    sortProperty = "viewsCount";
                    break;
                case "title":
                    sortProperty = "title";
                    direction = Sort.Direction.ASC;
                    break;
                default:
                    break;
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProperty));
        return movieRepository.findByFilters(query, genreId, year, pageable).map(this::convertToDTO);
    }

    /**
     * Get AI-powered personalized recommendations for a user.
     * Calls the Python FastAPI AI service (Collaborative Filtering).
     * Falls back to popular movies if AI service is unavailable or user has no history.
     */
    public List<MovieDTO> getRecommendedMovies(Long userId, int limit) {
        try {
            String url = aiServiceUrl + "/recommend/" + userId + "?limit=" + limit;
            logger.info("Calling AI service for user {}: {}", userId, url);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getBody() == null) return getPopularMovies(limit);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> recommendations =
                    (List<Map<String, Object>>) response.getBody().get("recommendations");

            if (recommendations == null || recommendations.isEmpty()) {
                logger.info("AI returned empty recommendations for user {}, falling back to popular", userId);
                return getPopularMovies(limit);
            }

            // Extract movie IDs from AI response and fetch full movie data
            List<Long> movieIds = recommendations.stream()
                    .map(rec -> Long.valueOf(rec.get("movie_id").toString()))
                    .collect(Collectors.toList());

            List<MovieDTO> result = new ArrayList<>();
            for (Long movieId : movieIds) {
                try {
                    Movie movie = movieRepository.findById(movieId).orElse(null);
                    if (movie != null && movie.getStatus() == Movie.ProcessingStatus.READY) {
                        result.add(convertToDTO(movie));
                    }
                } catch (Exception e) {
                    logger.warn("Could not load movie {} from AI recommendations", movieId);
                }
            }

            if (result.isEmpty()) return getPopularMovies(limit);
            logger.info("AI returned {} recommendations for user {}", result.size(), userId);
            return result;

        } catch (Exception e) {
            logger.error("AI service unavailable for user {}: {}. Falling back to popular movies.", userId, e.getMessage());
            return getPopularMovies(limit);
        }
    }

    public List<MovieDTO> getRelatedMovies(Long movieId, int limit) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));

        if (movie.getGenres().isEmpty()) {
            return List.of();
        }

        List<Integer> genreIds = movie.getGenres().stream()
                .map(Genre::getId)
                .collect(Collectors.toList());

        Pageable pageable = PageRequest.of(0, limit + 1);
        List<Movie> related = movieRepository.findByGenreIds(genreIds, pageable);

        return related.stream()
                .filter(m -> !m.getId().equals(movieId))
                .limit(limit)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"movies", "popularMovies"}, allEntries = true)
    public MovieDTO updateMovie(Long id, CreateMovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));

        movie.setTitle(request.getTitle());
        movie.setDescription(request.getDescription());
        movie.setPosterUrl(request.getPosterUrl());
        if (request.getBackdropUrl() != null) movie.setBackdropUrl(request.getBackdropUrl());
        if (request.getTrailerUrl() != null) movie.setTrailerUrl(request.getTrailerUrl());
        movie.setReleaseYear(request.getReleaseYear());
        movie.setDurationSec(request.getDurationSec());
        if (request.getDirector() != null) movie.setDirector(request.getDirector());
        if (request.getCast() != null) movie.setCast(request.getCast());
        if (request.getLanguage() != null) movie.setLanguage(request.getLanguage());
        if (request.getAgeRating() != null) movie.setAgeRating(request.getAgeRating());

        if (request.getGenreIds() != null) {
            Set<Genre> genres = new HashSet<>();
            for (Integer genreId : request.getGenreIds()) {
                Genre genre = genreRepository.findById(genreId)
                        .orElseThrow(() -> new ResourceNotFoundException("Genre not found"));
                genres.add(genre);
            }
            movie.setGenres(genres);
        }

        Movie updatedMovie = movieRepository.save(movie);
        return convertToDTO(updatedMovie);
    }

    @Transactional
    public void updateMovieStatus(Long id, Movie.ProcessingStatus status) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
        movie.setStatus(status);
        movieRepository.save(movie);
    }

    @Transactional
    @CacheEvict(value = {"movies", "popularMovies"}, allEntries = true)
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
        movieRepository.delete(movie);
    }

    private MovieDTO convertToDTO(Movie movie) {
        List<String> genreNames = movie.getGenres().stream()
                .map(Genre::getName)
                .collect(Collectors.toList());

        MovieDTO dto = new MovieDTO();
        dto.setId(movie.getId());
        dto.setTitle(movie.getTitle());
        dto.setDescription(movie.getDescription());
        dto.setPosterUrl(movie.getPosterUrl());
        dto.setBackdropUrl(movie.getBackdropUrl());
        dto.setTrailerUrl(movie.getTrailerUrl());
        dto.setReleaseYear(movie.getReleaseYear());
        dto.setDurationSec(movie.getDurationSec());
        dto.setViewsCount(movie.getViewsCount());
        dto.setAvgRating(movie.getAvgRating());
        dto.setStatus(movie.getStatus().name());
        dto.setGenres(genreNames);
        dto.setCreatedAt(movie.getCreatedAt());
        dto.setDirector(movie.getDirector());
        dto.setCast(movie.getCast());
        dto.setLanguage(movie.getLanguage());
        dto.setAgeRating(movie.getAgeRating());
        return dto;
    }
}
