-- Seed data for bookings table
-- Note: Adjust dates as needed for current/future dates
INSERT INTO bookings (userId, seatId, bookingDate, slot, status) VALUES
(2, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'AM', 'active'),
(2, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'PM', 'active'),
(3, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'AM', 'active'),
(4, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'AM', 'active'),
(5, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'PM', 'active'),
(2, 6, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'AM', 'active'),
(3, 7, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'PM', 'active'),
(4, 8, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'AM', 'active'),
(5, 9, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'AM', 'active'),
(2, 2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'AM', 'active'),
(3, 3, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'PM', 'active'),
(4, 4, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'PM', 'active');
