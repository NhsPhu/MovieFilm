package com.movieplatform.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseMigrationConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseMigrationConfig.class);

    @Bean
    public CommandLineRunner migrateDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                logger.info("Running database migrations...");
                jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL");
                logger.info("Successfully altered 'users' table to allow NULL emails.");
            } catch (Exception e) {
                logger.warn("Migration warning (might already be applied or table doesn't exist): {}", e.getMessage());
            }
        };
    }
}
