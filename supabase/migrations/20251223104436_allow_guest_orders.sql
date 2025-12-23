/*
  # Allow Guest Orders

  1. Changes
    - Make user_id nullable in orders table to support guest checkout
    - Update indexes to handle nullable user_id
    - Add guest_email field for guest order tracking
    - Add guest_name field for guest information
    
  2. New Columns
    - guest_email (text, nullable) - Email for guest orders
    - guest_name (text, nullable) - Name for guest orders
    
  3. Security
    - No RLS policies needed as authentication is handled at application level
    
  4. Important Notes
    - When user_id is NULL, the order is a guest order
    - Guest orders should use guest_email and guest_name fields
    - Registered user orders will still use user_id
*/

-- Make user_id nullable
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Add guest fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name text;

-- Add index for guest email lookups
CREATE INDEX IF NOT EXISTS orders_guest_email_idx ON orders(guest_email) WHERE guest_email IS NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN orders.user_id IS 'Foreign key to users table. NULL for guest orders.';
COMMENT ON COLUMN orders.guest_email IS 'Email address for guest orders (when user_id is NULL)';
COMMENT ON COLUMN orders.guest_name IS 'Name for guest orders (when user_id is NULL)';
