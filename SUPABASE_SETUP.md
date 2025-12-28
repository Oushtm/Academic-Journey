# Supabase Setup Guide

## Problem
Currently, the app uses `localStorage` which is browser-specific. Each device/browser starts with empty storage, so you have to create admin account again on each device.

## Solution: Supabase Database
We'll use Supabase (free PostgreSQL database) to store data that persists across all devices.

## Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up for free account
3. Create a new project
4. Wait for project to initialize (takes ~2 minutes)

## Step 2: Get Your Supabase Credentials
1. In your Supabase project dashboard, go to Settings → API
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` `public` key)

## Step 3: Create Database Tables
Go to SQL Editor in Supabase and run this SQL:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE
);

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

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

## Step 4: Configure Environment Variables
1. Create `.env.local` file in your project root:
```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Add to `.env.example`:
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

3. **IMPORTANT**: Add `.env.local` to `.gitignore` (don't commit secrets!)

## Step 5: Enable RLS (Row Level Security) - Optional but Recommended
For basic setup, you can disable RLS for now. In Supabase dashboard:
- Go to Authentication → Policies
- For each table, you can add policies or disable RLS temporarily for development

For production, you should enable RLS with proper policies.

## Step 6: Install Dependencies
```bash
npm install @supabase/supabase-js
```

## Step 7: Deploy to Vercel
1. In Vercel dashboard, go to your project Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
3. Redeploy your app

Now your data will persist across all devices!

