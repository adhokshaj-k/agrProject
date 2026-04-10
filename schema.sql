-- AgriConnect AI – MySQL Schema
-- Run this to RESET and set up the database from scratch.
-- WARNING: This drops the entire 'agriconnect' database and recreates it.
-- Any old Spring Boot / legacy data will be removed.

-- Drop and recreate the database (cleanest reset)
DROP DATABASE IF EXISTS agriconnect;
CREATE DATABASE agriconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agriconnect;


-- ─────────────────── USERS ───────────────────
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('farmer', 'seller', 'admin') NOT NULL DEFAULT 'farmer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- Insert default admin (password: admin123)
INSERT IGNORE INTO users (name, email, hashed_password, role, is_active, is_approved)
VALUES (
    'Admin',
    'admin@agriconnect.com',
    '$2b$12$3KC/5jS7SzE0JGUgIM6QDev/cjeqNBWsCWG4y6EwylGHzOMCLtlS.',
    'admin',
    TRUE,
    TRUE
);

-- ─────────────────── PRODUCTS ───────────────────
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    seller_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_category (category),
    INDEX idx_products_name (name),
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────── MACHINES ───────────────────
CREATE TABLE IF NOT EXISTS machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    daily_rate DECIMAL(10, 2) NOT NULL,
    location VARCHAR(200),
    category VARCHAR(100),
    image_url VARCHAR(500),
    owner_id INT NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_machines_location (location),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────── SERVICES ───────────────────
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    provider_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_services_category (category),
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────── BOOKINGS ───────────────────
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    machine_id INT,
    service_id INT,
    start_date DATETIME,
    end_date DATETIME,
    total_amount DECIMAL(10, 2),
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- ─────────────────── PAYMENTS ───────────────────
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT,
    razorpay_order_id VARCHAR(200),
    razorpay_payment_id VARCHAR(200),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_payments_user (user_id),
    INDEX idx_payments_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- ─────────────────── REVIEWS ───────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─────────────────── AI: DISEASE PREDICTIONS ───────────────────
CREATE TABLE IF NOT EXISTS disease_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    image_filename VARCHAR(300),
    disease_name VARCHAR(200) NOT NULL,
    confidence DECIMAL(5, 4) NOT NULL,
    treatment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_disease_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─────────────────── AI: CHAT HISTORY ───────────────────
CREATE TABLE IF NOT EXISTS chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─────────────────── SAMPLE DATA ───────────────────
-- Sample products
INSERT IGNORE INTO products (name, description, price, stock, category, seller_id) VALUES
('Organic Wheat Seeds', 'High-yield drought-resistant wheat variety for Rabi season', 450.00, 500, 'Seeds', 1),
('NPK Fertilizer 19:19:19', 'Balanced water-soluble fertilizer for all crops', 880.00, 200, 'Fertilizers', 1),
('Neem Oil Pesticide', 'Organic neem-based pesticide, safe for all crops', 320.00, 150, 'Pesticides', 1);

-- Sample machines
INSERT IGNORE INTO machines (name, description, daily_rate, location, category, owner_id) VALUES
('Tractor JD 5310', 'John Deere 55HP tractor with cultivator attachment', 2500.00, 'Punjab', 'Tractor', 1),
('Paddy Transplanter', 'Semi-automatic 6-row paddy transplanter', 1800.00, 'Haryana', 'Planting', 1);

-- Sample services
INSERT IGNORE INTO services (name, description, price, category, provider_id) VALUES
('Soil Testing', 'Complete NPK + pH soil analysis with report', 500.00, 'Testing', 1),
('Drone Spraying', 'Agricultural drone spraying service per acre', 800.00, 'Spraying', 1),
('Tractor Ploughing', 'Field preparation ploughing service per acre', 1200.00, 'Ploughing', 1);
