-- Seed the `affiliates` table
INSERT INTO affiliates (id, name, initials) VALUES
('8a61a3e8-118a-428a-8a58-5e7836b7f3d4', 'The Bridge', 'TB');

-- Seed the `groups` table with location and schedule
-- Durban North: Tuesday at 18:30
INSERT INTO groups (affiliate_id, name, format, specialisation, latitude, longitude, meeting_day, meeting_time) VALUES
('8a61a3e8-118a-428a-8a58-5e7836b7f3d4', 'Durban North Weekly', 'In-person', 'General Recovery', -29.7823, 31.0422, 'Tuesday', '18:30:00');

-- Cape Town: Thursday at 19:00
INSERT INTO groups (affiliate_id, name, format, specialisation, latitude, longitude, meeting_day, meeting_time) VALUES
('8a61a3e8-118a-428a-8a58-5e7836b7f3d4', 'Cape Town Evening Group', 'In-person', 'Working Professionals', -33.9249, 18.4241, 'Thursday', '19:00:00');

-- Online: Wednesday at 20:00
INSERT INTO groups (affiliate_id, name, format, specialisation, latitude, longitude, meeting_day, meeting_time) VALUES
('8a61a3e8-118a-428a-8a58-5e7836b7f3d4', 'Online National Group', 'Online', 'General Recovery', NULL, NULL, 'Wednesday', '20:00:00');

