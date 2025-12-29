-- Add this to your Supabase SQL Editor to create the schedule events table
-- Run this after running CREATE_TABLES.sql

-- Drop existing table if it exists (to update schema)
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS schedule_events CASCADE;

-- Schedule Events table
CREATE TABLE IF NOT EXISTS schedule_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('class', 'exam', 'event', 'holiday')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  subject_id TEXT,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  day_of_week TEXT CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'))
);

-- Attendance Records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES schedule_events(id) ON DELETE CASCADE,
  subject_id TEXT,
  date TEXT NOT NULL,
  is_absent BOOLEAN NOT NULL DEFAULT TRUE,
  marked_at BIGINT NOT NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_schedule_events_start_date ON schedule_events(start_date);
CREATE INDEX IF NOT EXISTS idx_schedule_events_type ON schedule_events(type);
CREATE INDEX IF NOT EXISTS idx_schedule_events_created_by ON schedule_events(created_by);
CREATE INDEX IF NOT EXISTS idx_schedule_events_recurring ON schedule_events(is_recurring);
CREATE INDEX IF NOT EXISTS idx_schedule_events_day_of_week ON schedule_events(day_of_week);

CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON attendance_records(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject_id ON attendance_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);

-- Disable Row Level Security (RLS) to allow access
ALTER TABLE schedule_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;

