-- Seed data for users table
INSERT INTO users (email, passwordHash, role, name) VALUES
('admin@example.com', '$2b$10$3yYDm0Cyu7dJ7btw829PE.oA2m8j2Xb2ASiUkFI2Le6E6iU.vz7qS', 'admin', 'Admin User'),
('john.doe@example.com', '$2b$10$3yYDm0Cyu7dJ7btw829PE.oA2m8j2Xb2ASiUkFI2Le6E6iU.vz7qS', 'employee', 'John Doe'),
('jane.smith@example.com', '$2b$10$3yYDm0Cyu7dJ7btw829PE.oA2m8j2Xb2ASiUkFI2Le6E6iU.vz7qS', 'employee', 'Jane Smith'),
('mike.wilson@example.com', '$2b$10$3yYDm0Cyu7dJ7btw829PE.oA2m8j2Xb2ASiUkFI2Le6E6iU.vz7qS', 'employee', 'Mike Wilson'),
('sarah.johnson@example.com', '$2b$10$3yYDm0Cyu7dJ7btw829PE.oA2m8j2Xb2ASiUkFI2Le6E6iU.vz7qS', 'employee', 'Sarah Johnson');

-- Password for all users: '12345678'
