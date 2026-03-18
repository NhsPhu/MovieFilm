-- Movie Streaming Platform Database Schema
-- MySQL 8.0+
CREATE DATABASE IF NOT EXISTS moviedb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE moviedb;
-- Users Table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Genres Table
CREATE TABLE genres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    INDEX idx_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Movies Table
CREATE TABLE movies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    poster_url VARCHAR(500),
    release_year INT,
    folder_path VARCHAR(500) NOT NULL,
    duration_sec INT,
    views_count BIGINT NOT NULL DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,
    status ENUM('PROCESSING', 'READY', 'FAILED') NOT NULL DEFAULT 'PROCESSING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_views (views_count DESC),
    INDEX idx_rating (avg_rating DESC),
    INDEX idx_year (release_year DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Movie-Genre Junction Table
CREATE TABLE movie_genres (
    movie_id BIGINT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Watch History Table (Critical for Cross-Platform Sync)
CREATE TABLE watch_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    current_time_sec INT NOT NULL DEFAULT 0,
    is_finished BOOLEAN NOT NULL DEFAULT FALSE,
    last_watched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    device_type ENUM('WEB', 'ANDROID', 'DESKTOP') NOT NULL,
    UNIQUE KEY uq_user_movie (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    INDEX idx_user_watched (user_id, last_watched_at DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Ratings Table
CREATE TABLE ratings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    score INT NOT NULL CHECK (
        score >= 1
        AND score <= 5
    ),
    review TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_movie_rating (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    INDEX idx_movie_score (movie_id, score)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Insert Sample Genres
INSERT INTO genres (name, slug)
VALUES ('Action', 'action'),
    ('Comedy', 'comedy'),
    ('Drama', 'drama'),
    ('Horror', 'horror'),
    ('Sci-Fi', 'sci-fi'),
    ('Romance', 'romance'),
    ('Thriller', 'thriller'),
    ('Animation', 'animation'),
    ('Documentary', 'documentary'),
    ('Fantasy', 'fantasy');
-- Insert Admin User (password: admin123)
-- Note: This is a bcrypt hash of "admin123" - should be changed in production
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
        'admin@movieplatform.com',
        '$2a$10$XptfOQgGPHWJGnQOjzEZEOz6LkZKCY8YvH9Axt8/0hqX5q/aH5Rle',
        'Admin User',
        'ADMIN'
    );