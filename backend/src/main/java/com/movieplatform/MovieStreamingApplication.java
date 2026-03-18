package com.movieplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MovieStreamingApplication {
    public static void main(String[] args) {
        SpringApplication.run(MovieStreamingApplication.class, args);
    }
}
