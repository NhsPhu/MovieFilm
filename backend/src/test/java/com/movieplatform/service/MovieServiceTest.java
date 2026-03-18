package com.movieplatform.service;

import com.movieplatform.dto.movie.CreateMovieRequest;
import com.movieplatform.dto.movie.MovieDTO;
import com.movieplatform.entity.Genre;
import com.movieplatform.entity.Movie;
import com.movieplatform.exception.ResourceNotFoundException;
import com.movieplatform.repository.GenreRepository;
import com.movieplatform.repository.MovieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MovieServiceTest {

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private GenreRepository genreRepository;

    @InjectMocks
    private MovieService movieService;

    private Movie sampleMovie;
    private Genre sampleGenre;

    @BeforeEach
    void setUp() {
        sampleGenre = new Genre(1, "Action", "action");

        sampleMovie = new Movie();
        sampleMovie.setId(1L);
        sampleMovie.setTitle("Avengers");
        sampleMovie.setDescription("Marvel movie");
        sampleMovie.setPosterUrl("https://example.com/poster.jpg");
        sampleMovie.setReleaseYear(2019);
        sampleMovie.setDurationSec(10800);
        sampleMovie.setViewsCount(5000L);
        sampleMovie.setAvgRating(4.5);
        sampleMovie.setStatus(Movie.ProcessingStatus.READY);
        sampleMovie.setGenres(Set.of(sampleGenre));
        sampleMovie.setCreatedAt(LocalDateTime.now());
        sampleMovie.setFolderPath("movies/test-uuid");
    }

    @Test
    void getMovieById_Success() {
        // Given
        when(movieRepository.findById(1L)).thenReturn(Optional.of(sampleMovie));
        when(movieRepository.save(any(Movie.class))).thenReturn(sampleMovie);

        // When
        MovieDTO result = movieService.getMovieById(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Avengers", result.getTitle());
        assertEquals(5001L, result.getViewsCount()); // views incremented
    }

    @Test
    void getMovieById_NotFound_ThrowsException() {
        // Given
        when(movieRepository.findById(99L)).thenReturn(Optional.empty());

        // When / Then
        assertThrows(ResourceNotFoundException.class, () -> movieService.getMovieById(99L));
    }

    @Test
    void createMovie_Success() {
        // Given
        CreateMovieRequest request = new CreateMovieRequest();
        request.setTitle("New Movie");
        request.setDescription("Description");
        request.setReleaseYear(2024);
        request.setDurationSec(7200);
        request.setGenreIds(List.of(1));

        when(genreRepository.findById(1)).thenReturn(Optional.of(sampleGenre));
        when(movieRepository.save(any(Movie.class))).thenAnswer(invocation -> {
            Movie m = invocation.getArgument(0);
            m.setId(2L);
            m.setCreatedAt(LocalDateTime.now());
            return m;
        });

        // When
        MovieDTO result = movieService.createMovie(request);

        // Then
        assertNotNull(result);
        assertEquals("New Movie", result.getTitle());
        assertEquals("PROCESSING", result.getStatus());
        verify(movieRepository).save(any(Movie.class));
    }

    @Test
    void searchMovies_ReturnsPagedResults() {
        // Given
        Page<Movie> moviePage = new PageImpl<>(List.of(sampleMovie));
        when(movieRepository.searchByTitle(eq("avengers"), any(Pageable.class))).thenReturn(moviePage);

        // When
        Page<MovieDTO> result = movieService.searchMovies("avengers", 0, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Avengers", result.getContent().get(0).getTitle());
    }

    @Test
    void getPopularMovies_ReturnsList() {
        // Given
        when(movieRepository.findPopularMovies(any(Pageable.class))).thenReturn(List.of(sampleMovie));

        // When
        List<MovieDTO> result = movieService.getPopularMovies(5);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Avengers", result.get(0).getTitle());
    }

    @Test
    void deleteMovie_Success() {
        // Given
        when(movieRepository.findById(1L)).thenReturn(Optional.of(sampleMovie));
        doNothing().when(movieRepository).delete(sampleMovie);

        // When
        assertDoesNotThrow(() -> movieService.deleteMovie(1L));

        // Then
        verify(movieRepository).delete(sampleMovie);
    }

    @Test
    void updateMovieStatus_Success() {
        // Given
        when(movieRepository.findById(1L)).thenReturn(Optional.of(sampleMovie));
        when(movieRepository.save(any(Movie.class))).thenReturn(sampleMovie);

        // When
        assertDoesNotThrow(() -> movieService.updateMovieStatus(1L, Movie.ProcessingStatus.READY));

        // Then
        verify(movieRepository).save(argThat(m -> m.getStatus() == Movie.ProcessingStatus.READY));
    }
}
