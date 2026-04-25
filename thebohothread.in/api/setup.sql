-- ============================================================
-- TheBohoThread — MySQL Database Setup
-- Run this once in your MySQL / phpMyAdmin to create all tables
-- ============================================================

CREATE DATABASE IF NOT EXISTS thebohothread
  DEFAULT CHARACTER SET = 'utf8mb4'
  DEFAULT COLLATE = 'utf8mb4_unicode_ci';

USE thebohothread;

-- ── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  icon       VARCHAR(20)  DEFAULT '🏷️',   -- VARCHAR(20) to safely hold emojis
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── BADGES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  color      VARCHAR(20)  DEFAULT '#c9a84c',
  text_color VARCHAR(20)  DEFAULT '#ffffff',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(255)   NOT NULL,
  category       VARCHAR(100),
  description    TEXT,
  price          DECIMAL(10,2)  NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2)  DEFAULT NULL,
  rating         DECIMAL(3,1)   DEFAULT NULL,
  badge          VARCHAR(100)   DEFAULT '',
  image          MEDIUMTEXT     DEFAULT '',   -- MEDIUMTEXT to safely hold base64 images (primary/thumbnail)
  images         MEDIUMTEXT     DEFAULT NULL,  -- JSON array of up to 10 image URLs/base64
  sizes          TEXT           DEFAULT NULL,  -- JSON array: [{size, price, original_price}]
  is_deleted     TINYINT(1)     NOT NULL DEFAULT 0,  -- 0 = active, 1 = soft-deleted/inactive
  created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── REVIEWS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  product_id   INT          NOT NULL,
  product_name VARCHAR(255) DEFAULT '',
  author       VARCHAR(100) DEFAULT 'Anonymous',
  rating       TINYINT      NOT NULL DEFAULT 5,
  review_text  TEXT         DEFAULT '',
  status       ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  approved_at  TIMESTAMP    NULL DEFAULT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ALTER existing tables if upgrading (run if tables already exist) ──
-- ALTER TABLE categories MODIFY icon VARCHAR(20) DEFAULT '🏷️';
-- ALTER TABLE products   MODIFY image MEDIUMTEXT  DEFAULT '';

-- ── SEED DEFAULT BADGES ─────────────────────────────────────
INSERT IGNORE INTO badges (name, color, text_color) VALUES
  ('New',        '#4caf7d', '#ffffff'),
  ('Sale',       '#e05c5c', '#ffffff'),
  ('Bestseller', '#c9a84c', '#0d1b2a'),
  ('Hot',        '#f5692a', '#ffffff');

-- ── SEED DEFAULT CATEGORIES ─────────────────────────────────
INSERT IGNORE INTO categories (name, icon) VALUES
  ('Decor',     '🏺'),
  ('Textiles',  '🧶'),
  ('Furniture', '🪑'),
  ('Kitchen',   '🍳'),
  ('Lighting',  '💡');

-- ── TRENDING PRODUCTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trending_products (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  added_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trending_product (product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ALTER EXISTING products table (run if table already exists) ──
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS images MEDIUMTEXT DEFAULT NULL;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes  TEXT        DEFAULT NULL;
