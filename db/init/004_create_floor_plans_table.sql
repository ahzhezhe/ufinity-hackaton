-- Floor plans table for storing uploaded floor plan images
CREATE TABLE IF NOT EXISTS floorPlans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    imagePath VARCHAR(500) NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    uploadedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_floorPlans_active (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
