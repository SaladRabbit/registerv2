-- Enable the PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ----------------------------------------------------------------
-- 1. Create the `affiliates` table
-- ----------------------------------------------------------------
CREATE TABLE affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    initials TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 2. Create the `groups` table with location and schedule columns
-- ----------------------------------------------------------------
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    format TEXT, -- e.g., 'In-person', 'Online'
    specialisation TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    meeting_day TEXT, -- e.g., 'Tuesday'
    meeting_time TIME, -- e.g., '18:30:00'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- (The rest of the tables: members, orientation_details, attendance_register remain the same)
-- ----------------------------------------------------------------
-- 3. Create the `members` table
-- ----------------------------------------------------------------
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    orientation_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 4. Create the `orientation_details` table
-- ----------------------------------------------------------------
CREATE TABLE orientation_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID UNIQUE REFERENCES members(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT,
    ethnicity TEXT,
    reason_for_attending TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 5. Create the `attendance_register` table
-- ----------------------------------------------------------------
CREATE TABLE attendance_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

