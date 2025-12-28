# Your Supabase Credentials

## 📝 Create .env.local File (for local testing)

Create a file named `.env.local` in your project root with these contents:

```env
VITE_SUPABASE_URL=https://pkvckwnutpvhjfyfsmcr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdmNrd251dHB2aGpmeWZzbWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MjgyMDIsImV4cCI6MjA4MjUwNDIwMn0.DVZm3MyvxMimcvdMgncvenQZG3fKWVpz-DFI7Pm5F6g
```

## 🚀 Add to Vercel (REQUIRED for production)

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:

   **Variable 1:**
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://pkvckwnutpvhjfyfsmcr.supabase.co`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 2:**
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdmNrd251dHB2aGpmeWZzbWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MjgyMDIsImV4cCI6MjA4MjUwNDIwMn0.DVZm3MyvxMimcvdMgncvenQZG3fKWVpz-DFI7Pm5F6g`
   - Environments: ✅ Production ✅ Preview ✅ Development

4. Click **Save**
5. Go to Deployments → Redeploy

## 🗄️ Create Database Tables (REQUIRED)

1. Go to: https://supabase.com/dashboard/project/pkvckwnutpvhjfyfsmcr
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Paste and run this SQL:

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

## ✅ After Setup

1. Test locally: `npm run dev` (with .env.local file)
2. Deploy to Vercel (after adding environment variables)
3. Create admin account on Vercel site
4. Try logging in from different device - it should work! 🎉

