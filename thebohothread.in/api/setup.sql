-- ============================================================
-- TheBohoThread — MySQL Database Setup
-- Run this once in your MySQL / phpMyAdmin to create all tables
-- ============================================================

CREATE DATABASE IF NOT EXISTS thebohothread
  DEFAULT CHARACTER SET = 'utf8mb4';

USE thebohothread;

-- ── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  icon       VARCHAR(10)  DEFAULT '🏷️',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── BADGES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  color      VARCHAR(20)  DEFAULT '#c9a84c',
  text_color VARCHAR(20)  DEFAULT '#ffffff',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  category       VARCHAR(100),
  description    TEXT,
  price          DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2) DEFAULT NULL,
  rating         DECIMAL(3,1)  DEFAULT NULL,
  badge          VARCHAR(100)  DEFAULT '',
  image          TEXT          DEFAULT '',
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
);

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
