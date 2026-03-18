package com.movieplatform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieplatform.dto.auth.RegisterRequest;
import com.movieplatform.entity.Genre;
import com.movieplatform.entity.Movie;
import com.movieplatform.repository.GenreRepository;
import com.movieplatform.repository.MovieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MovieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private GenreRepository genreRepository;

    private Movie readyMovie;
    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        // Create a test genre
        Genre genre = new Genre();
        genre.setName("Action Test");
        genre.setSlug("action-test");
        genre = genreRepository.save(genre);

        // Create a READY movie
        readyMovie = new Movie();
        readyMovie.setTitle("Test Avengers Movie");
        readyMovie.setDescription("A superhero movie");
        readyMovie.setReleaseYear(2024);
        readyMovie.setDurationSec(7200);
        readyMovie.setStatus(Movie.ProcessingStatus.READY);
        readyMovie.setFolderPath("movies/test-movie");
        readyMovie.setViewsCount(100L);
        readyMovie.setAvgRating(4.0);
        Set<Genre> genres = new HashSet<>();
        genres.add(genre);
        readyMovie.setGenres(genres);
        readyMovie = movieRepository.save(readyMovie);

        // Register and get auth token
        RegisterRequest reg = new RegisterRequest();
        reg.setEmail("movietest@test.com");
        reg.setPassword("password123");
        reg.setFullName("Movie Test User");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        authToken = objectMapper.readTree(responseBody).get("token").asText();
    }

    @Test
    void getAllMovies_PublicAccess_Returns200() throws Exception {
        mockMvc.perform(get("/api/movies")
                .param("readyOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].title").value("Test Avengers Movie"));
    }

    @Test
    void getMovieById_Returns200AndIncrementsView() throws Exception {
        Long movieId = readyMovie.getId();

        mockMvc.perform(get("/api/movies/" + movieId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(movieId))
                .andExpect(jsonPath("$.title").value("Test Avengers Movie"))
                .andExpect(jsonPath("$.viewsCount").value(101)); // 100 + 1
    }

    @Test
    void getMovieById_NotFound_Returns404() throws Exception {
        mockMvc.perform(get("/api/movies/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void searchMovies_FindsByTitle_Returns200() throws Exception {
        mockMvc.perform(get("/api/movies/search")
                .param("q", "avengers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].title").value("Test Avengers Movie"));
    }

    @Test
    void searchMovies_NoResults_ReturnsEmptyPage() throws Exception {
        mockMvc.perform(get("/api/movies/search")
                .param("q", "nonexistentmovieXYZ123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty());
    }

    @Test
    void getPopularMovies_Returns200() throws Exception {
        mockMvc.perform(get("/api/movies/popular")
                .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getAllGenres_Returns200() throws Exception {
        mockMvc.perform(get("/api/genres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void rateMovie_WithAuth_Returns200() throws Exception {
        String ratingJson = "{\"score\": 4, \"review\": \"Great movie!\"}";

        mockMvc.perform(post("/api/movies/" + readyMovie.getId() + "/rate")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(ratingJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(4))
                .andExpect(jsonPath("$.review").value("Great movie!"));
    }

    @Test
    void rateMovie_WithoutAuth_Returns403() throws Exception {
        String ratingJson = "{\"score\": 4, \"review\": \"Great movie!\"}";

        mockMvc.perform(post("/api/movies/" + readyMovie.getId() + "/rate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(ratingJson))
                .andExpect(status().is4xxClientError());
    }
}
