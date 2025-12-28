# Fix 404 NOT_FOUND Error

This error means the database tables don't exist yet in Supabase. Follow these steps:

## ✅ Step 1: Create Database Tables

1. Go to: https://supabase.com/dashboard/project/pkvckwnutpvhjfyfsmcr
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. **Copy and paste this ENTIRE SQL script** (don't miss anything):

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

5. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
6. You should see "Success. No rows returned" - that's good!

## ✅ Step 2: Disable Row Level Security (RLS) Temporarily

By default, Supabase blocks all queries. We need to disable RLS for now:

1. In Supabase dashboard, go to **Authentication** → **Policies**
2. Or go to **Table Editor** → Click on each table
3. For each table (`users`, `shared_structure`, `user_data`):
   - Click on the table name
   - Look for "Row Level Security" toggle
   - **Turn it OFF** (disable RLS) for now

**OR** run this SQL in SQL Editor:

```sql
-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_structure DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_data DISABLE ROW LEVEL SECURITY;
```

## ✅ Step 3: Verify Tables Exist

1. Go to **Table Editor** in Supabase
2. You should see 3 tables:
   - `users`
   - `shared_structure`
   - `user_data`

If you see them, you're good! If not, go back to Step 1.

## ✅ Step 4: Test Again

1. Refresh your app
2. Try creating an admin account
3. The 404 error should be gone!

## 🔍 If Still Getting Errors

1. Open browser Console (F12)
2. Look for error messages
3. Check if the error says which table is missing
4. Make sure you ran ALL the SQL from Step 1
5. Make sure RLS is disabled (Step 2)

## 🔒 Security Note (Later)

For production, you should enable RLS and create proper policies. But for now, disabling RLS will get it working.

