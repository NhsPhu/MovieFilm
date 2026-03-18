package com.movieplatform.service;

import com.movieplatform.dto.rating.RatingDTO;
import com.movieplatform.dto.rating.RatingRequest;
import com.movieplatform.entity.Movie;
import com.movieplatform.entity.Rating;
import com.movieplatform.entity.User;
import com.movieplatform.exception.ResourceNotFoundException;
import com.movieplatform.repository.MovieRepository;
import com.movieplatform.repository.RatingRepository;
import com.movieplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Transactional
    public RatingDTO rateMovie(String email, Long movieId, RatingRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));

        // Upsert: cập nhật nếu đã rating, tạo mới nếu chưa
        Rating rating = ratingRepository.findByUserIdAndMovieId(user.getId(), movieId)
                .orElse(new Rating());

        // Incremental average calculation
        Double oldScore = rating.getId() != null ? rating.getScore() : null;
        
        rating.setUser(user);
        rating.setMovie(movie);
        rating.setScore(request.getScore());
        rating.setReview(request.getReview());

        Rating saved = ratingRepository.save(rating);

        // Update avg_rating iteratively
        long totalRatings = ratingRepository.countByMovieId(movieId);
        double currentAvg = movie.getAvgRating() != null ? movie.getAvgRating() : 0.0;
        double newAvg;

        if (oldScore == null) {
            // New rating
            newAvg = totalRatings == 0 ? request.getScore() : ((currentAvg * (totalRatings - 1)) + request.getScore()) / totalRatings;
        } else {
            // Updated rating
            newAvg = totalRatings == 0 ? request.getScore() : ((currentAvg * totalRatings) - oldScore + request.getScore()) / totalRatings;
        }

        movie.setAvgRating(Math.round(newAvg * 10.0) / 10.0); // Round to 1 decimal place
        movieRepository.save(movie);

        return toDTO(saved);
    }

    public List<RatingDTO> getMovieRatings(Long movieId) {
        return ratingRepository.findByMovieIdOrderByCreatedAtDesc(movieId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private RatingDTO toDTO(Rating r) {
        return new RatingDTO(
                r.getId(),
                r.getUser().getId(),
                r.getUser().getFullName(),
                r.getMovie().getId(),
                r.getScore(),
                r.getReview(),
                r.getCreatedAt());
    }
}
