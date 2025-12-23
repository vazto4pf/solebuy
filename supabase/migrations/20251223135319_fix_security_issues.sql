/*
  # Fix Security Issues
  
  1. Remove Duplicate Indexes
    - Drop old `purchases_*` indexes that remained after table rename
    - Keep only the `orders_*` indexes for better naming consistency
    
  2. Remove Unused Indexes
    - Drop `users_is_admin_idx` (not used in queries)
    - Drop `orders_guest_email_idx` (guest functionality not implemented)
    
  3. Fix Duplicate Policies
    - Drop duplicate INSERT policy "Users can create own purchases"
    - Keep "Users can insert own orders" policy
    
  4. Enable RLS (Critical Security Fix)
    - Enable RLS on `orders` table
    - Enable RLS on `users` table
    - Create proper policies for secure access
    
  5. Security Notes
    - RLS must be enabled for proper security in Supabase
    - Application-level security is not sufficient
    - Each table requires restrictive policies by default
*/

-- Drop duplicate indexes from old purchases table name
DROP INDEX IF EXISTS purchases_user_id_idx;
DROP INDEX IF EXISTS purchases_status_idx;
DROP INDEX IF EXISTS purchases_created_at_idx;

-- Drop unused indexes
DROP INDEX IF EXISTS users_is_admin_idx;
DROP INDEX IF EXISTS orders_guest_email_idx;

-- Drop duplicate and old policies
DROP POLICY IF EXISTS "Users can create own purchases" ON orders;
DROP POLICY IF EXISTS "Users can update own purchases" ON orders;
DROP POLICY IF EXISTS "Admins can view all purchases" ON orders;
DROP POLICY IF EXISTS "Admins can update all purchases" ON orders;

-- Enable RLS on both tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own account"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own account"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (
    auth.uid()::text = id::text
    AND is_admin = (SELECT is_admin FROM users WHERE id::text = auth.uid()::text)
  );

CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  );

-- Orders table policies (already exist, just ensuring they're correct)
-- Users can view own orders policy already exists
-- Users can insert own orders policy already exists

CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.is_admin = true
    )
  );

-- Update comments
COMMENT ON TABLE users IS 'Custom users table with RLS enabled for secure authentication';
COMMENT ON TABLE orders IS 'Orders table with RLS enabled. Users can only access their own orders unless admin';
