package com.movieplatform.service;

import com.movieplatform.entity.Movie;
import com.movieplatform.exception.ResourceNotFoundException;
import com.movieplatform.repository.MovieRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class VideoTranscodingService {

    private static final Logger logger = LoggerFactory.getLogger(VideoTranscodingService.class);

    @Value("${app.video.storage.path:../storage}")
    private String storagePath;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private MovieService movieService;

    private final ExecutorService executorService = Executors.newFixedThreadPool(2);
    private final ConcurrentHashMap<Long, Integer> transcodeProgress = new ConcurrentHashMap<>();

    public void transcodeVideoAsync(Long movieId, String inputFilePath) {
        transcodeProgress.put(movieId, 0);
        executorService.submit(() -> {
            try {
                transcodeVideo(movieId, inputFilePath);
            } catch (Exception e) {
                logger.error("Transcoding failed for movie {}: {}", movieId, e.getMessage());
                movieService.updateMovieStatus(movieId, Movie.ProcessingStatus.FAILED);
                transcodeProgress.remove(movieId);
            }
        });
    }

    public Integer getProgress(Long movieId) {
        return transcodeProgress.getOrDefault(movieId, -1);
    }

    public void transcodeVideo(Long movieId, String inputFilePath) throws Exception {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));

        Integer durationSec = movie.getDurationSec();
        if (durationSec == null || durationSec <= 0) {
            durationSec = 1; // Fallback to avoid division by zero
        }

        Path outputDirPath = Paths.get(storagePath, movie.getFolderPath()).toAbsolutePath().normalize();
        Files.createDirectories(outputDirPath);
        String outputDir = outputDirPath.toString() + File.separator;

        String[][] qualities = {
                { "1080p", "1920:1080", "5000k" },
                { "720p", "1280:720", "2800k" },
                { "480p", "854:480", "1400k" },
                { "360p", "640:360", "800k" }
        };

        logger.info("Starting transcoding for movie: {}", movie.getTitle());

        for (int i = 0; i < qualities.length; i++) {
            String[] quality = qualities[i];
            String qualityName = quality[0];
            String resolution = quality[1];
            String bitrate = quality[2];

            String qualityDir = outputDir + qualityName + "/";
            Files.createDirectories(Paths.get(qualityDir));

            String outputPlaylist = qualityDir + "index.m3u8";
            String segmentPattern = qualityDir + "segment_%03d.ts";

            List<String> command = Arrays.asList(
                    "ffmpeg",
                    "-i", inputFilePath,
                    "-vf", "scale=" + resolution,
                    "-c:v", "libx264",
                    "-b:v", bitrate,
                    "-c:a", "aac",
                    "-b:a", "128k",
                    "-hls_time", "10",
                    "-hls_playlist_type", "vod",
                    "-hls_segment_filename", segmentPattern,
                    outputPlaylist);

            logger.info("Transcoding to {}...", qualityName);
            int baseProgress = i * 25;
            executeFFmpegCommand(movieId, command, baseProgress, durationSec);
        }

        generateMasterPlaylist(outputDir, qualities);

        movieService.updateMovieStatus(movieId, Movie.ProcessingStatus.READY);
        transcodeProgress.put(movieId, 100);
        logger.info("Transcoding completed for movie: {}", movie.getTitle());

        Files.deleteIfExists(Paths.get(inputFilePath));
    }

    private void executeFFmpegCommand(Long movieId, List<String> command, int baseProgress, int totalDurationSec) throws Exception {
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
            String line;
            Pattern timePattern = Pattern.compile("time=(\\d\\d):(\\d\\d):(\\d\\d\\.\\d\\d)");
            while ((line = reader.readLine()) != null) {
                // Parse FFmpeg output to get current time
                Matcher matcher = timePattern.matcher(line);
                if (matcher.find()) {
                    int hours = Integer.parseInt(matcher.group(1));
                    int minutes = Integer.parseInt(matcher.group(2));
                    double seconds = Double.parseDouble(matcher.group(3));
                    double currentSeconds = (hours * 3600) + (minutes * 60) + seconds;
                    
                    int currentPhaseProgress = (int) Math.round((currentSeconds / totalDurationSec) * 25);
                    if (currentPhaseProgress > 25) currentPhaseProgress = 25;
                    
                    int overallProgress = baseProgress + currentPhaseProgress;
                    if (overallProgress > 99) overallProgress = 99; // 100 is reserved for completion
                    
                    transcodeProgress.put(movieId, overallProgress);
                }
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("FFmpeg process failed with exit code: " + exitCode);
        }
    }

    private void generateMasterPlaylist(String outputDir, String[][] qualities) throws Exception {
        StringBuilder m3u8Content = new StringBuilder();
        m3u8Content.append("#EXTM3U\n");
        m3u8Content.append("#EXT-X-VERSION:3\n");

        for (String[] quality : qualities) {
            String qualityName = quality[0];
            String resolution = quality[1];
            String bitrate = quality[2];

            int bandwidth = Integer.parseInt(bitrate.replace("k", "")) * 1000;

            m3u8Content.append(String.format(
                    "#EXT-X-STREAM-INF:BANDWIDTH=%d,RESOLUTION=%s\n",
                    bandwidth, resolution));
            m3u8Content.append(qualityName).append("/index.m3u8\n");
        }

        Path masterPlaylistPath = Paths.get(outputDir + "master.m3u8");
        try (FileWriter writer = new FileWriter(masterPlaylistPath.toFile())) {
            writer.write(m3u8Content.toString());
        }

        logger.info("Master playlist generated: {}", masterPlaylistPath);
    }
}
