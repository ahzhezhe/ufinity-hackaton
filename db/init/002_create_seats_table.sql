-- Seats table with flexible metadata
CREATE TABLE IF NOT EXISTS seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('regular', 'standing') NOT NULL DEFAULT 'regular',
    isBlocked BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_seats_type (type),
    INDEX idx_seats_isBlocked (isBlocked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seat metadata for flexible key-value tags
CREATE TABLE IF NOT EXISTS seatMetadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seatId INT NOT NULL,
    metaKey VARCHAR(100) NOT NULL,
    metaValue VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (seatId) REFERENCES seats(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat_meta (seatId, metaKey),
    INDEX idx_seatMetadata_key (metaKey)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
