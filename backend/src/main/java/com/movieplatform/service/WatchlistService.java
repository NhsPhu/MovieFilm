package com.movieplatform.service;

import com.movieplatform.dto.watchlist.WatchlistItemDTO;
import com.movieplatform.entity.Genre;
import com.movieplatform.entity.Movie;
import com.movieplatform.entity.User;
import com.movieplatform.entity.Watchlist;
import com.movieplatform.exception.ResourceNotFoundException;
import com.movieplatform.repository.MovieRepository;
import com.movieplatform.repository.UserRepository;
import com.movieplatform.repository.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WatchlistService {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    public List<WatchlistItemDTO> getWatchlist(String email) {
        User user = userRepository.findByEmailOrPhoneNumber(email, email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return watchlistRepository.findByUserIdOrderByAddedAtDesc(user.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> addToWatchlist(String email, Long movieId) {
        User user = userRepository.findByEmailOrPhoneNumber(email, email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));

        if (watchlistRepository.existsByUserIdAndMovieId(user.getId(), movieId)) {
            return Map.of("added", false, "message", "Already in watchlist");
        }

        Watchlist item = new Watchlist();
        item.setUser(user);
        item.setMovie(movie);
        watchlistRepository.save(item);

        return Map.of("added", true, "message", "Added to watchlist");
    }

    @Transactional
    public Map<String, Object> removeFromWatchlist(String email, Long movieId) {
        User user = userRepository.findByEmailOrPhoneNumber(email, email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        watchlistRepository.deleteByUserIdAndMovieId(user.getId(), movieId);
        return Map.of("removed", true);
    }

    public Map<String, Boolean> checkInWatchlist(String email, Long movieId) {
        User user = userRepository.findByEmailOrPhoneNumber(email, email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        boolean inList = watchlistRepository.existsByUserIdAndMovieId(user.getId(), movieId);
        return Map.of("inWatchlist", inList);
    }

    private WatchlistItemDTO convertToDTO(Watchlist item) {
        Movie movie = item.getMovie();
        List<String> genres = movie.getGenres().stream()
                .map(Genre::getName)
                .collect(Collectors.toList());

        return new WatchlistItemDTO(
                item.getId(),
                movie.getId(),
                movie.getTitle(),
                movie.getPosterUrl(),
                movie.getBackdropUrl(),
                movie.getReleaseYear(),
                movie.getAvgRating(),
                movie.getDurationSec(),
                genres,
                item.getAddedAt()
        );
    }
}
