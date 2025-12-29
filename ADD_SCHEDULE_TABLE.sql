-- Add this to your Supabase SQL Editor to create the schedule events table
-- Run this after running CREATE_TABLES.sql

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
  updated_at BIGINT NOT NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_schedule_events_start_date ON schedule_events(start_date);
CREATE INDEX IF NOT EXISTS idx_schedule_events_type ON schedule_events(type);
CREATE INDEX IF NOT EXISTS idx_schedule_events_created_by ON schedule_events(created_by);

-- Disable Row Level Security (RLS) to allow access
ALTER TABLE schedule_events DISABLE ROW LEVEL SECURITY;

