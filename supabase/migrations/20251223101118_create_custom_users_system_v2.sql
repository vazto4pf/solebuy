/*
  # Create custom users table and update system
  
  1. New Tables
    - `users` - Custom authentication table with email and password
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `full_name` (text)
      - `is_admin` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Changes
    - Drop profiles table
    - Create new users table  
    - Update orders foreign key to reference new users table
    - Disable RLS (application-level security)
    
  3. Security
    - No RLS policies (handled in application)
    - Passwords hashed with SHA-256 in application
    - Admin status checked in application code
*/

-- Drop old triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Drop old constraints on orders
ALTER TABLE orders DROP CONSTRAINT IF EXISTS purchases_user_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Drop profiles table
DROP TABLE IF EXISTS profiles CASCADE;

-- Create new users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  is_admin boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Disable RLS (we handle security in application)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Add foreign key constraint from orders to users
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_is_admin_idx ON users(is_admin);

-- Add comments
COMMENT ON TABLE users IS 'Custom users table for authentication. Security handled at application level.';
COMMENT ON TABLE orders IS 'Orders table. Application must filter by user_id for user queries.';
