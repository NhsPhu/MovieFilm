-- Billing System Schema for RimCinema
-- Run this after the main schema.sql

USE moviedb;

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    rank_level ENUM('MEMBER', 'CLOSE', 'VIP') NOT NULL,
    price DECIMAL(12, 0) NOT NULL DEFAULT 0,
    duration_days INT NOT NULL DEFAULT 30,
    features TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Payment Orders Table (Invoice History)
CREATE TABLE IF NOT EXISTS payment_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    plan_id INT NOT NULL,
    amount DECIMAL(12, 0) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'QR_BANK_TRANSFER',
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    plan_name VARCHAR(50),
    expires_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    INDEX idx_user_orders (user_id, created_at DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Seed default plans
INSERT INTO subscription_plans (name, rank_level, price, duration_days, features) VALUES
('Gói Thành Viên', 'MEMBER', 0, 0, 'Xem phim có quảng cáo;Chất lượng 720p;1 thiết bị'),
('Gói Thân Thiết', 'CLOSE', 79000, 30, 'Không quảng cáo;Chất lượng 1080p;2 thiết bị;Tải phim offline'),
('Gói VIP', 'VIP', 149000, 30, 'Không quảng cáo;Chất lượng 4K;4 thiết bị;Tải phim offline;Xem phim sớm');
