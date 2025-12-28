# Quick Setup Guide - Fix Data Persistence Issue

## The Problem
Your app uses `localStorage` which is stored in each browser. When you deploy to Vercel, each device starts with empty localStorage, so you have to create admin account again.

## The Solution: Supabase (Free Database)

### Step 1: Create Supabase Account (2 minutes)
1. Go to https://supabase.com
2. Click "Start your project" → Sign up (free)
3. Create a new project
4. Wait 2 minutes for setup

### Step 2: Get Your Keys
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (the long key under "Project API keys")

### Step 3: Create Database Tables
1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Paste and run this SQL:

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

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

### Step 4: Add Environment Variables to Vercel
1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these two variables:
   - Name: `VITE_SUPABASE_URL`
     Value: Your Project URL from Step 2
   - Name: `VITE_SUPABASE_ANON_KEY`
     Value: Your anon public key from Step 2
4. Click **Save**
5. Go to **Deployments** → Click **⋯** on latest deployment → **Redeploy**

### Step 5: Test
1. Visit your Vercel site
2. Create admin account (this will save to Supabase database)
3. Open site on different device/PC
4. Login should work - no need to create admin again! ✅

## Important Notes
- The code is already set up to use Supabase when environment variables are present
- If Supabase is not configured, it falls back to localStorage (works for local development)
- Data is saved to both Supabase AND localStorage (as backup)

## Troubleshooting
- If you get errors, check browser console
- Make sure environment variables are set correctly in Vercel
- Make sure you ran the SQL to create tables
- Redeploy after adding environment variables

