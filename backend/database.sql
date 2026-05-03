-- ═══════════════════════════════════════════════════════════
--  MatkaKing SAKTA MATKA — Complete Database Schema
--  Run this in phpMyAdmin
-- ═══════════════════════════════════════════════════════════

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`             VARCHAR(100) NOT NULL,
  `mobile`           VARCHAR(15) NOT NULL UNIQUE,
  `password`         VARCHAR(255) NOT NULL,
  `role`             ENUM('user','admin') DEFAULT 'user',
  `wallet_balance`   DECIMAL(10,2) DEFAULT 0.00,
  `winning_balance`  DECIMAL(10,2) DEFAULT 0.00,
  `is_blocked`       TINYINT(1) DEFAULT 0,
  `referred_by`      INT UNSIGNED DEFAULT NULL,
  `last_login`       DATETIME DEFAULT NULL,
  `created_at`       DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_mobile` (`mobile`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── GAMES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `games` (
  `id`                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`                 VARCHAR(100) NOT NULL,
  `open_time`            TIME NOT NULL,
  `close_time`           TIME NOT NULL,
  `result_time`          TIME NOT NULL,
  `status`               ENUM('open','closed','deleted') DEFAULT 'closed',
  `open_result`          VARCHAR(10) DEFAULT NULL,
  `close_result`         VARCHAR(10) DEFAULT NULL,
  `jodi_result`          VARCHAR(5) DEFAULT NULL,
  `min_bid`              DECIMAL(10,2) DEFAULT 10.00,
  `max_bid`              DECIMAL(10,2) DEFAULT 10000.00,
  `result_declared_at`   DATETIME DEFAULT NULL,
  `created_at`           DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── BIDS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `bids` (
  `id`                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`            INT UNSIGNED NOT NULL,
  `game_id`            INT UNSIGNED NOT NULL,
  `game_type`          VARCHAR(50) NOT NULL,
  `session`            ENUM('open','close') NOT NULL,
  `number`             VARCHAR(20) NOT NULL,
  `amount`             DECIMAL(10,2) NOT NULL,
  `potential_winning`  DECIMAL(12,2) DEFAULT 0.00,
  `win_amount`         DECIMAL(12,2) DEFAULT 0.00,
  `wallet_deducted`    DECIMAL(10,2) DEFAULT 0.00,
  `winning_deducted`   DECIMAL(10,2) DEFAULT 0.00,
  `status`             ENUM('pending','won','lost','cancelled') DEFAULT 'pending',
  `created_at`         DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_game` (`game_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`game_id`) REFERENCES `games`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── TRANSACTIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `transactions` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`      INT UNSIGNED NOT NULL,
  `type`         ENUM('credit','debit') NOT NULL,
  `wallet_type`  ENUM('wallet','winning_wallet') NOT NULL,
  `amount`       DECIMAL(10,2) NOT NULL,
  `description`  VARCHAR(255) DEFAULT NULL,
  `reference_id` INT UNSIGNED DEFAULT NULL,
  `status`       ENUM('pending','completed','failed') DEFAULT 'completed',
  `created_at`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── DEPOSIT & WITHDRAWAL REQUESTS ────────────────────────────
CREATE TABLE IF NOT EXISTS `deposit_requests` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`        INT UNSIGNED NOT NULL,
  `type`           ENUM('deposit','withdrawal') DEFAULT 'deposit',
  `amount`         DECIMAL(10,2) NOT NULL,
  `payment_proof`  VARCHAR(255) DEFAULT NULL,
  `utr_number`     VARCHAR(50) DEFAULT NULL,
  `upi_id`         VARCHAR(100) DEFAULT NULL,
  `bank_name`      VARCHAR(100) DEFAULT NULL,
  `account_number` VARCHAR(50) DEFAULT NULL,
  `ifsc_code`      VARCHAR(20) DEFAULT NULL,
  `status`         ENUM('pending','approved','rejected') DEFAULT 'pending',
  `admin_note`     VARCHAR(255) DEFAULT NULL,
  `created_at`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_type_status` (`type`,`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── SITE SETTINGS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key`   VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT DEFAULT NULL,
  `updated_at`    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── NOTICES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `notices` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `message`    TEXT NOT NULL,
  `type`       ENUM('info','warning','success','danger') DEFAULT 'info',
  `is_active`  TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ═══════════════════════════════════════════════════════════
--  DEFAULT DATA
-- ═══════════════════════════════════════════════════════════

-- Default site settings
INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`) VALUES
('upi_id',          'yourname@upi'),
('upi_name',        'MatkaKing'),
('min_deposit',     '100'),
('max_deposit',     '100000'),
('min_withdrawal',  '500'),
('max_withdrawal',  '50000'),
('whatsapp_support','9999999999'),
('site_name',       'MatkaKing SAKTA MATKA'),
('maintenance_mode','0');

-- Default games
INSERT IGNORE INTO `games` (`name`, `open_time`, `close_time`, `result_time`, `status`, `min_bid`, `max_bid`) VALUES
('Kalyan',      '15:30:00', '17:30:00', '17:45:00', 'open', 10, 10000),
('Milan Day',   '13:00:00', '14:30:00', '14:45:00', 'open', 10, 10000),
('Rajdhani Day','15:30:00', '17:30:00', '17:45:00', 'closed', 10, 5000),
('Main Bazar',  '21:00:00', '23:00:00', '23:30:00', 'open', 10, 10000),
('Milan Night', '21:00:00', '23:00:00', '23:30:00', 'open', 10, 10000),
('Time Bazar',  '11:00:00', '12:30:00', '12:45:00', 'open', 10, 5000),
('Sridevi',     '11:30:00', '12:30:00', '12:45:00', 'open', 10, 5000);

-- Welcome notice
INSERT IGNORE INTO `notices` (`message`, `type`, `is_active`) VALUES
('🎯 MatkaKing SAKTA MATKA mein aapka swagat hai! Khelo aur jeeto!', 'success', 1),
('💰 Withdrawal sirf winning wallet se hogi. Min ₹500.', 'info', 1);
