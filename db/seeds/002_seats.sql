-- Seed data for seats table
INSERT INTO seats (name, type, isBlocked) VALUES
('A1', 'regular', FALSE),
('A2', 'regular', FALSE),
('A3', 'standing', FALSE),
('A4', 'regular', FALSE),
('A5', 'regular', TRUE),
('B1', 'regular', FALSE),
('B2', 'standing', FALSE),
('B3', 'regular', FALSE),
('B4', 'regular', FALSE),
('B5', 'regular', FALSE),
('C1', 'standing', FALSE),
('C2', 'regular', FALSE),
('C3', 'regular', FALSE),
('C4', 'standing', FALSE),
('C5', 'regular', FALSE);

-- Seed data for seatMetadata (tags/attributes)
INSERT INTO seatMetadata (seatId, metaKey, metaValue) VALUES
(1, 'location', 'Window Side'),
(1, 'floor', '1'),
(2, 'location', 'Center'),
(2, 'floor', '1'),
(3, 'location', 'Corner'),
(3, 'floor', '1'),
(6, 'location', 'Window Side'),
(6, 'floor', '2'),
(7, 'location', 'Center'),
(7, 'floor', '2'),
(11, 'location', 'Quiet Zone'),
(11, 'floor', '2'),
(12, 'location', 'Collaboration Area'),
(12, 'floor', '2');
