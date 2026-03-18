package com.movieplatform.repository;

import com.movieplatform.entity.WatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchHistoryRepository extends JpaRepository<WatchHistory, Long> {
    Optional<WatchHistory> findByUserIdAndMovieId(Long userId, Long movieId);

    List<WatchHistory> findByUserIdOrderByLastWatchedAtDesc(Long userId);
}
