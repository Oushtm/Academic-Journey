# ✅ Supabase Setup - Next Steps

## ✅ Credentials Added
Your Supabase credentials have been added to `.env.local` (local testing only).

## ⚠️ IMPORTANT: Add to Vercel

You MUST add these environment variables to Vercel for production:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these two variables:

   **Variable 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://pkvckwnutpvhjfyfsmcr.supabase.co`
   
   **Variable 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdmNrd251dHB2aGpmeWZzbWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MjgyMDIsImV4cCI6MjA4MjUwNDIwMn0.DVZm3MyvxMimcvdMgncvenQZG3fKWVpz-DFI7Pm5F6g`

4. Make sure to select **Production**, **Preview**, and **Development** environments
5. Click **Save**
6. Go to **Deployments** → Click **⋯** on latest deployment → **Redeploy**

## 🔧 Step 2: Create Database Tables

You MUST run this SQL in Supabase to create the tables:

1. Go to https://supabase.com/dashboard/project/pkvckwnutpvhjfyfsmcr
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste this SQL and click **Run**:

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

## ✅ Step 3: Test

After adding to Vercel and creating tables:

1. Visit your Vercel site
2. Create admin account (this will save to Supabase database)
3. Open site on different device/PC
4. Login should work - no need to create admin again! ✅

## 🔒 Security Note

The `.env.local` file is already in `.gitignore` so it won't be committed to GitHub. 
However, the anon key is safe to be exposed in frontend code - it's designed for public use.
Just make sure you never commit your service_role key (if you use one later).



