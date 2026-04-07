package com.movieplatform.repository;

import com.movieplatform.entity.WatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchHistoryRepository extends JpaRepository<WatchHistory, Long> {
    Optional<WatchHistory> findByUserIdAndMovieId(Long userId, Long movieId);

    List<WatchHistory> findByUserIdOrderByLastWatchedAtDesc(Long userId);

    List<WatchHistory> findTop5ByOrderByLastWatchedAtDesc();

    Long countByLastWatchedAtAfter(java.time.LocalDateTime dateTime);

    @Modifying
    @Query("DELETE FROM WatchHistory wh WHERE wh.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
