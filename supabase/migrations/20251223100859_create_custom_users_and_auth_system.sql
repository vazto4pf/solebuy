/*
  # Create custom users table and authentication system
  
  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User ID
      - `email` (text, unique) - User email address
      - `password_hash` (text) - Hashed password
      - `full_name` (text) - User's full name
      - `is_admin` (boolean) - Whether the user is an administrator
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      
  2. Changes
    - Drop old profiles table
    - Drop old foreign key constraints on orders table
    - Update orders table to reference new users table
    
  3. Security
    - Enable RLS on `users` table
    - Users can read their own user record
    - Users can update their own user record (except password and is_admin)
    - Admins can view all users
    
  4. Important Notes
    - This creates a completely custom authentication system
    - Passwords will be hashed in the application layer
    - No dependency on Supabase Auth (auth.users)
*/

-- Drop old triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_admin();

-- Drop old profiles table
DROP TABLE IF EXISTS profiles CASCADE;

-- Create custom users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  is_admin boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop old orders foreign key if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'purchases_user_id_fkey' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT purchases_user_id_fkey;
  END IF;
END $$;

-- Add new foreign key to orders table
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- RLS Policies for users table
CREATE POLICY "Users can view own record"
  ON users
  FOR SELECT
  USING (id = (current_setting('app.user_id', true)::uuid));

CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (current_setting('app.user_id', true)::uuid)
      AND users.is_admin = true
    )
  );

CREATE POLICY "Users can update own record"
  ON users
  FOR UPDATE
  USING (id = (current_setting('app.user_id', true)::uuid))
  WITH CHECK (
    id = (current_setting('app.user_id', true)::uuid)
    AND is_admin = (SELECT is_admin FROM users WHERE id = (current_setting('app.user_id', true)::uuid))
  );

-- Update orders RLS policies to use custom users table
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  USING (user_id = (current_setting('app.user_id', true)::uuid));

CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  WITH CHECK (user_id = (current_setting('app.user_id', true)::uuid));

CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (current_setting('app.user_id', true)::uuid)
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (current_setting('app.user_id', true)::uuid)
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (current_setting('app.user_id', true)::uuid)
      AND users.is_admin = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_is_admin_idx ON users(is_admin);

-- Add comment to table
COMMENT ON TABLE users IS 'Custom users table for authentication without Supabase Auth';
