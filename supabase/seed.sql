-- Seed the `affiliates` table
INSERT INTO affiliates (id, name, initials) VALUES
('8a61a3e8-118a-428a-8a58-5e7836b7f3d4', 'The Bridge', 'TB');

-- supabase/seed.sql
-- This file will run automatically after 'npx supabase db reset'

-- Example 1: An in-person group
INSERT INTO public.groups (
    id,
    name,
    format,
    latitude,
    longitude,
    meeting_day,
    meeting_time,
    timezone
) VALUES (
    '61f6c3d8-73d9-479b-b726-fa87c8845e34', -- The ID from your error!
    'Durban North In-Person',
    'In-person',
    -29.7941, -- Example latitude (Durban North)
    31.0402,  -- Example longitude (Durban North)
    '2', -- '2' = Tuesday
    '18:30:00',
    'Africa/Johannesburg'
);

-- Example 2: An online group
INSERT INTO public.groups (
    id,
    name,
    format,
    latitude,
    longitude,
    meeting_day,
    meeting_time,
    timezone
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- A new UUID
    'Online National Group',
    'Online',
    0,  -- No location needed for online
    0,  -- No location needed for online
    '4', -- '4' = Thursday
    '19:00:00',
    'Africa/Johannesburg'
);

-- Add more INSERT statements for all your other groups here...
