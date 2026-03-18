package com.movieplatform.service;

import com.movieplatform.dto.history.UpdateProgressRequest;
import com.movieplatform.dto.history.WatchHistoryDTO;
import com.movieplatform.entity.Movie;
import com.movieplatform.entity.User;
import com.movieplatform.entity.WatchHistory;
import com.movieplatform.exception.ResourceNotFoundException;
import com.movieplatform.repository.MovieRepository;
import com.movieplatform.repository.UserRepository;
import com.movieplatform.repository.WatchHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WatchHistoryServiceTest {

    @Mock
    private WatchHistoryRepository watchHistoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MovieRepository movieRepository;

    @InjectMocks
    private WatchHistoryService watchHistoryService;

    private User sampleUser;
    private Movie sampleMovie;
    private WatchHistory sampleHistory;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setEmail("user@example.com");
        sampleUser.setFullName("Test User");
        sampleUser.setRole(User.UserRole.USER);

        sampleMovie = new Movie();
        sampleMovie.setId(1L);
        sampleMovie.setTitle("Test Movie");
        sampleMovie.setDurationSec(7200);
        sampleMovie.setStatus(Movie.ProcessingStatus.READY);
        sampleMovie.setGenres(Set.of());
        sampleMovie.setFolderPath("movies/test");
        sampleMovie.setViewsCount(0L);

        sampleHistory = new WatchHistory();
        sampleHistory.setId(1L);
        sampleHistory.setUser(sampleUser);
        sampleHistory.setMovie(sampleMovie);
        sampleHistory.setCurrentTimeSec(1800);
        sampleHistory.setIsFinished(false);
        sampleHistory.setLastWatchedAt(LocalDateTime.now());
        sampleHistory.setDeviceType(WatchHistory.DeviceType.WEB);
    }

    @Test
    void updateProgress_CreateNew_Success() {
        // Given
        UpdateProgressRequest request = new UpdateProgressRequest();
        request.setMovieId(1L);
        request.setCurrentTime(1800);
        request.setDevice("WEB");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(sampleUser));
        when(movieRepository.findById(1L)).thenReturn(Optional.of(sampleMovie));
        when(watchHistoryRepository.findByUserIdAndMovieId(1L, 1L)).thenReturn(Optional.empty());
        when(watchHistoryRepository.save(any(WatchHistory.class))).thenReturn(sampleHistory);

        // When
        WatchHistoryDTO result = watchHistoryService.updateProgress("user@example.com", request);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getMovieId());
        assertEquals(1800, result.getCurrentTimeSec());
        verify(watchHistoryRepository).save(any(WatchHistory.class));
    }

    @Test
    void updateProgress_UpdateExisting_MarksFinished() {
        // Given
        UpdateProgressRequest request = new UpdateProgressRequest();
        request.setMovieId(1L);
        request.setCurrentTime(6900); // 96% of 7200 -> isFinished = true
        request.setDevice("ANDROID");

        WatchHistory existingHistory = new WatchHistory();
        existingHistory.setId(1L);
        existingHistory.setUser(sampleUser);
        existingHistory.setMovie(sampleMovie);
        existingHistory.setCurrentTimeSec(3600);
        existingHistory.setIsFinished(false);
        existingHistory.setLastWatchedAt(LocalDateTime.now());
        existingHistory.setDeviceType(WatchHistory.DeviceType.WEB);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(sampleUser));
        when(movieRepository.findById(1L)).thenReturn(Optional.of(sampleMovie));
        when(watchHistoryRepository.findByUserIdAndMovieId(1L, 1L)).thenReturn(Optional.of(existingHistory));
        when(watchHistoryRepository.save(any(WatchHistory.class))).thenAnswer(inv -> {
            WatchHistory h = inv.getArgument(0);
            h.setDeviceType(WatchHistory.DeviceType.ANDROID); // Ensure device type is set
            return h;
        });

        // When
        WatchHistoryDTO result = watchHistoryService.updateProgress("user@example.com", request);

        // Then
        assertNotNull(result);
        // Should mark as finished since 6900/7200 = 95.8% >= 95%
        verify(watchHistoryRepository).save(argThat(h -> h.getIsFinished()));
    }

    @Test
    void updateProgress_UserNotFound_ThrowsException() {
        // Given
        UpdateProgressRequest request = new UpdateProgressRequest();
        request.setMovieId(1L);
        request.setCurrentTime(100);

        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        // When / Then
        assertThrows(ResourceNotFoundException.class,
                () -> watchHistoryService.updateProgress("notfound@example.com", request));
    }

    @Test
    void getUserHistory_ReturnsList() {
        // Given
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(sampleUser));
        when(watchHistoryRepository.findByUserIdOrderByLastWatchedAtDesc(1L))
                .thenReturn(List.of(sampleHistory));

        // When
        List<WatchHistoryDTO> result = watchHistoryService.getUserHistory("user@example.com");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Movie", result.get(0).getMovieTitle());
    }

    @Test
    void getMovieProgress_Found_ReturnsDTO() {
        // Given
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(sampleUser));
        when(watchHistoryRepository.findByUserIdAndMovieId(1L, 1L)).thenReturn(Optional.of(sampleHistory));

        // When
        WatchHistoryDTO result = watchHistoryService.getMovieProgress("user@example.com", 1L);

        // Then
        assertNotNull(result);
        assertEquals(1800, result.getCurrentTimeSec());
    }

    @Test
    void getMovieProgress_NotFound_ReturnsNull() {
        // Given
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(sampleUser));
        when(watchHistoryRepository.findByUserIdAndMovieId(1L, 1L)).thenReturn(Optional.empty());

        // When
        WatchHistoryDTO result = watchHistoryService.getMovieProgress("user@example.com", 1L);

        // Then
        assertNull(result);
    }
}
