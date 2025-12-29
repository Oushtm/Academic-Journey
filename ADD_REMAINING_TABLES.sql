-- Copy this entire file and paste it in Supabase SQL Editor
-- Then click "Run" or press Ctrl+Enter
-- This creates the remaining tables (you already have the users table)

-- Shared academic structure
CREATE TABLE IF NOT EXISTS shared_structure (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at BIGINT NOT NULL
);

-- User-specific data
CREATE TABLE IF NOT EXISTS user_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at BIGINT NOT NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);

-- Disable Row Level Security (RLS) to allow access
-- You can enable RLS later with proper policies for security
ALTER TABLE shared_structure DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_data DISABLE ROW LEVEL SECURITY;


