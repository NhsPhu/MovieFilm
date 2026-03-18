package com.movieplatform.repository;

import com.movieplatform.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findByUserIdAndMovieId(Long userId, Long movieId);

    List<Rating> findByMovieIdOrderByCreatedAtDesc(Long movieId);

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.movie.id = :movieId")
    Double calculateAverageRating(Long movieId);

    long countByMovieId(Long movieId);
}
