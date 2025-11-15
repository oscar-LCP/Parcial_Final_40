-- Crear base de datos
CREATE DATABASE IF NOT EXISTS vuelos_app;
USE vuelos_app;

-- ============================================================
-- TABLA: USERS
-- Roles: administrador, gestor
-- ============================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('administrador', 'gestor') DEFAULT 'gestor',
    token VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Datos de prueba
INSERT INTO users (name, email, password, role) VALUES
('Admin General', 'admin@system.com', 'admin123', 'administrador'),
('Gestor Principal', 'gestor@system.com', 'gestor123', 'gestor');


-- ============================================================
-- TABLA: NAVES (Aeronaves)
-- ============================================================
CREATE TABLE naves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    model VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Datos de prueba
INSERT INTO naves (name, capacity, model) VALUES
('Aeronave A1', 180, 'Airbus A320'),
('Aeronave B2', 220, 'Boeing 737'),
('Aeronave C3', 150, 'Embraer E190');


-- ============================================================
-- TABLA: FLIGHTS (Vuelos)
-- ============================================================
CREATE TABLE flights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nave_id INT NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure DATETIME NOT NULL,
    arrival DATETIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nave_id) REFERENCES naves(id)
);

-- Datos de prueba
INSERT INTO flights (nave_id, origin, destination, departure, arrival, price) VALUES
(1, 'Bogotá', 'Medellín', '2025-12-01 08:00', '2025-12-01 09:00', 200000),
(1, 'Bogotá', 'Cali', '2025-12-02 10:00', '2025-12-02 11:20', 250000),
(2, 'Medellín', 'Cartagena', '2025-12-05 14:00', '2025-12-05 15:40', 350000),
(3, 'Cali', 'Barranquilla', '2025-12-10 06:00', '2025-12-10 07:40', 280000);


-- ============================================================
-- TABLA: RESERVATIONS (Reservas)
-- ============================================================
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    flight_id INT NOT NULL,
    status ENUM('activa', 'cancelada') DEFAULT 'activa',
    reserved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (flight_id) REFERENCES flights(id)
);

-- Datos de prueba
INSERT INTO reservations (user_id, flight_id, status) VALUES
(2, 1, 'activa'),
(2, 2, 'activa'),
(2, 3, 'cancelada');