# Debugging User Creation Issue

## Problem
Users are created but don't appear in the list, and the app keeps showing "Create Admin Account".

## Debug Steps

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab. Look for:
- Error messages when creating users
- Messages about loading/saving users
- Any Supabase-related errors

### 2. Check Supabase Database
1. Go to: https://supabase.com/dashboard/project/pkvckwnutpvhjfyfsmcr
2. Click **Table Editor**
3. Click on the `users` table
4. Do you see any users there?

If you see users in Supabase but the app doesn't load them, there's a loading issue.
If you DON'T see users in Supabase, there's a saving issue.

### 3. Check localStorage
In browser console, run:
```javascript
JSON.parse(localStorage.getItem('academic_users'))
```

Do you see users there?

### 4. Test Direct Supabase Query
In browser console, check if Supabase is connected:
```javascript
// Check if Supabase client exists
console.log(window.__SUPABASE__)
```

### 5. Common Issues

**Issue 1: RLS (Row Level Security) is blocking**
- Solution: Make sure you ran the SQL that disables RLS (in CREATE_TABLES.sql)

**Issue 2: Table names don't match**
- Check: Table name should be exactly `users` (lowercase, plural)
- Check: Column names should match exactly

**Issue 3: Data format mismatch**
- Check: `created_at` should be a BIGINT (number), not a timestamp string
- Check: `is_admin` should be BOOLEAN (true/false), not a string

**Issue 4: CORS or network issues**
- Check: Browser console for CORS errors
- Check: Network tab for failed requests

### 6. Verify Table Structure
Run this in Supabase SQL Editor to check your table structure:
```sql
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

Expected columns:
- id (text)
- username (text)
- password (text)
- created_at (bigint)
- is_admin (boolean)

### 7. Manual Test
Try inserting a user directly in Supabase SQL Editor:
```sql
INSERT INTO users (id, username, password, created_at, is_admin)
VALUES ('test-123', 'testuser', 'testpass', 1766935257559, false);
```

If this works, the table is fine and the issue is in the app code.
If this fails, there's a database/table issue.

