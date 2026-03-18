package com.movieplatform.controller;

import com.movieplatform.service.VideoTranscodingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/upload")
@PreAuthorize("hasRole('ADMIN')")
public class UploadController {

    @Value("${app.video.storage.path:../storage}")
    private String storagePath;

    @Autowired
    private VideoTranscodingService videoTranscodingService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("movieId") Long movieId) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File is empty"));
            }

            Path tempDirPath = Paths.get(storagePath, "temp").toAbsolutePath().normalize();
            Files.createDirectories(tempDirPath);

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path tempFilePath = tempDirPath.resolve(filename);

            Files.copy(file.getInputStream(), tempFilePath, StandardCopyOption.REPLACE_EXISTING);

            videoTranscodingService.transcodeVideoAsync(movieId, tempFilePath.toString());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Video uploaded successfully. Transcoding started.");
            response.put("movieId", movieId);
            response.put("status", "PROCESSING");

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
