package com.movieplatform.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Paths;

@RestController
@RequestMapping("/stream")
public class StreamController {

    @Value("${app.video.storage.path:../storage}")
    private String storagePath;

    @Autowired
    private com.movieplatform.repository.MovieRepository movieRepository;

    @GetMapping("/{movieId}/master.m3u8")
    public ResponseEntity<Resource> getMasterPlaylist(@PathVariable Long movieId) {
        try {
            com.movieplatform.entity.Movie movie = movieRepository.findById(movieId).orElse(null);
            if (movie == null || movie.getFolderPath() == null) {
                return ResponseEntity.notFound().build();
            }
            String filePath = storagePath + "/" + movie.getFolderPath() + "/master.m3u8";
            File file = new File(filePath);

            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "application/vnd.apple.mpegurl")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{movieId}/{quality}/index.m3u8")
    public ResponseEntity<Resource> getQualityPlaylist(
            @PathVariable Long movieId,
            @PathVariable String quality) {
        try {
            com.movieplatform.entity.Movie movie = movieRepository.findById(movieId).orElse(null);
            if (movie == null || movie.getFolderPath() == null) {
                return ResponseEntity.notFound().build();
            }
            String filePath = storagePath + "/" + movie.getFolderPath() + "/" + quality + "/index.m3u8";
            File file = new File(filePath);

            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "application/vnd.apple.mpegurl")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{movieId}/{quality}/{segment}")
    public ResponseEntity<Resource> getSegment(
            @PathVariable Long movieId,
            @PathVariable String quality,
            @PathVariable String segment) {
        try {
            com.movieplatform.entity.Movie movie = movieRepository.findById(movieId).orElse(null);
            if (movie == null || movie.getFolderPath() == null) {
                return ResponseEntity.notFound().build();
            }
            String filePath = storagePath + "/" + movie.getFolderPath() + "/" + quality + "/" + segment;
            File file = new File(filePath);

            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "video/MP2T")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
