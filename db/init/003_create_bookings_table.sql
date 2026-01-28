-- Bookings table for seat reservations (AM/PM half-day slots)
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    seatId INT NOT NULL,
    bookingDate DATE NOT NULL,
    slot ENUM('AM', 'PM') NOT NULL,
    status ENUM('active', 'cancelled') NOT NULL DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seatId) REFERENCES seats(id) ON DELETE CASCADE,

    -- Prevent double booking: same seat, date, and slot (only for active bookings)
    UNIQUE KEY unique_active_booking (seatId, bookingDate, slot, status),

    INDEX idx_bookings_user (userId),
    INDEX idx_bookings_seat (seatId),
    INDEX idx_bookings_date (bookingDate),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_date_slot (bookingDate, slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
