package com.movieplatform.repository;

import com.movieplatform.entity.Movie;
import com.movieplatform.entity.Movie.ProcessingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    Page<Movie> findByStatus(ProcessingStatus status, Pageable pageable);

    @Query("SELECT m FROM Movie m WHERE m.status = 'READY' ORDER BY m.viewsCount DESC")
    List<Movie> findPopularMovies(Pageable pageable);

    @Query("SELECT m FROM Movie m JOIN m.genres g WHERE g.id IN :genreIds AND m.status = 'READY'")
    List<Movie> findByGenreIds(@Param("genreIds") List<Integer> genreIds, Pageable pageable);

    @Query("SELECT m FROM Movie m WHERE m.status = 'READY' AND LOWER(m.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Movie> searchByTitle(@Param("query") String query, Pageable pageable);

    @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN m.genres g " +
           "WHERE m.status = 'READY' " +
           "AND (:query IS NULL OR :query = '' OR LOWER(m.title) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:genreId IS NULL OR g.id = :genreId) " +
           "AND (:year IS NULL OR m.releaseYear = :year)")
    Page<Movie> findByFilters(@Param("query") String query, @Param("genreId") Integer genreId, @Param("year") Integer year, Pageable pageable);
}
