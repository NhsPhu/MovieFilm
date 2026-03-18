package com.movieplatform.service;

import com.movieplatform.dto.movie.CreateMovieRequest;
import com.movieplatform.dto.movie.MovieDTO;
import com.movieplatform.entity.Genre;
import com.movieplatform.entity.Movie;
import com.movieplatform.exception.ResourceNotFoundException;
import com.movieplatform.repository.GenreRepository;
import com.movieplatform.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private GenreRepository genreRepository;

    @Transactional
    public MovieDTO createMovie(CreateMovieRequest request) {
        Movie movie = new Movie();
        movie.setTitle(request.getTitle());
        movie.setDescription(request.getDescription());
        movie.setPosterUrl(request.getPosterUrl());
        movie.setReleaseYear(request.getReleaseYear());
        movie.setDurationSec(request.getDurationSec());
        movie.setStatus(Movie.ProcessingStatus.PROCESSING);

        String folderPath = "movies/" + UUID.randomUUID().toString();
        movie.setFolderPath(folderPath);

        Set<Genre> genres = new HashSet<>();
        for (Integer genreId : request.getGenreIds()) {
            Genre genre = genreRepository.findById(genreId)
                    .orElseThrow(() -> new ResourceNotFoundException("Genre not found"));
            genres.add(genre);
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

    public MovieDTO getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));

        movie.setViewsCount(movie.getViewsCount() + 1);
        movieRepository.save(movie);

        return convertToDTO(movie);
    }

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
                    // default sort by createdAt desc
                    break;
            }
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProperty));
        return movieRepository.findByFilters(query, genreId, year, pageable).map(this::convertToDTO);
    }

    public List<MovieDTO> getRelatedMovies(Long movieId, int limit) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));

        if (movie.getGenres().isEmpty()) {
            return List.of(); // return empty list if no genres
        }

        List<Integer> genreIds = movie.getGenres().stream()
                .map(Genre::getId)
                .collect(Collectors.toList());

        Pageable pageable = PageRequest.of(0, limit);
        // Exclude the current movie by filtering it out in memory or custom query
        // Currently, findByGenreIds might fetch the current movie too.
        List<Movie> related = movieRepository.findByGenreIds(genreIds, pageable).getContent();

        return related.stream()
                .filter(m -> !m.getId().equals(movieId))
                .limit(limit)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MovieDTO updateMovie(Long id, CreateMovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));

        movie.setTitle(request.getTitle());
        movie.setDescription(request.getDescription());
        movie.setPosterUrl(request.getPosterUrl());
        movie.setReleaseYear(request.getReleaseYear());
        movie.setDurationSec(request.getDurationSec());

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
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
        movieRepository.delete(movie);
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
