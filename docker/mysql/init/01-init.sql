-- Money Notebook Database Schema
-- Encoding: UTF-8

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Users table (identified by 12-char code)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(12) NOT NULL UNIQUE COMMENT '12-character unique user code',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(50) NULL COMMENT 'Icon name or emoji',
    color VARCHAR(20) NULL COMMENT 'Hex color code',
    sort_order INT DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE COMMENT 'System default categories',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_category (user_id, name, type),
    INDEX idx_user_type (user_id, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL COMMENT 'Amount in VND',
    note TEXT NULL,
    transaction_date DATETIME NOT NULL COMMENT 'Date and time of transaction',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_user_date (user_id, transaction_date),
    INDEX idx_user_type_date (user_id, type, transaction_date),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories for new users (will be copied when user registers)
-- This is a template table
CREATE TABLE IF NOT EXISTS default_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(50) NULL,
    color VARCHAR(20) NULL,
    sort_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default income categories
INSERT INTO default_categories (name, type, icon, color, sort_order) VALUES
('Lương', 'income', 'wallet', '#52c41a', 1),
('Thưởng', 'income', 'gift', '#73d13d', 2),
('Đầu tư', 'income', 'stock', '#95de64', 3),
('Bán hàng', 'income', 'shop', '#b7eb8f', 4),
('Cho thuê', 'income', 'home', '#d9f7be', 5),
('Khác', 'income', 'ellipsis', '#f6ffed', 6);

-- Insert default expense categories
INSERT INTO default_categories (name, type, icon, color, sort_order) VALUES
('Ăn uống', 'expense', 'coffee', '#ff4d4f', 1),
('Di chuyển', 'expense', 'car', '#ff7a45', 2),
('Mua sắm', 'expense', 'shopping', '#ffa940', 3),
('Hóa đơn', 'expense', 'file-text', '#ffc53d', 4),
('Giải trí', 'expense', 'play-circle', '#ffec3d', 5),
('Sức khỏe', 'expense', 'heart', '#bae637', 6),
('Giáo dục', 'expense', 'book', '#73d13d', 7),
('Khác', 'expense', 'ellipsis', '#52c41a', 8);
