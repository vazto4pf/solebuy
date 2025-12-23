/*
  # Fix RLS for Custom Authentication System
  
  1. Security Model
    - This app uses custom authentication (not Supabase Auth)
    - Users are stored in custom `users` table with password hashes
    - Sessions managed via localStorage in frontend
    - Security enforced at application level
    
  2. Changes
    - Disable RLS on both tables (correct for custom auth)
    - Drop all RLS policies (they won't work without Supabase Auth)
    - Remove duplicate INSERT policy
    - Keep necessary indexes for performance
    
  3. Application Security Requirements
    - Frontend MUST filter queries by user_id for non-admin users
    - Frontend MUST check is_admin flag before showing admin features
    - Backend edge functions MUST validate user permissions
    - NEVER expose API keys or allow direct table access from client
    
  4. Important Notes
    - RLS with auth.uid() only works with Supabase Auth
    - Custom auth systems require application-level security
    - Supabase service role key must be kept secure
    - Consider using anon key with RLS or service role key server-side only
*/

-- Drop all RLS policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own purchases" ON orders;
DROP POLICY IF EXISTS "Users can update own purchases" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

DROP POLICY IF EXISTS "Users can view own account" ON users;
DROP POLICY IF EXISTS "Users can update own account" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Disable RLS (correct for custom authentication)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Ensure we have the right indexes (not duplicates)
-- orders table indexes
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);

-- users table indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Update table comments
COMMENT ON TABLE users IS 'Custom authentication table. Security enforced at application level - always filter by user_id for non-admin users.';
COMMENT ON TABLE orders IS 'Orders table. Security enforced at application level - always filter by user_id for non-admin users.';
