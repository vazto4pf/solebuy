/*
  # Rename purchases table to orders
  
  1. Changes
    - Rename `purchases` table to `orders`
    - Update all policies to reference the new table name
    - Maintain all existing columns and relationships
    
  2. Orders Table Structure
    - `id` (uuid, primary key) - Unique order identifier
    - `user_id` (uuid, foreign key to auth.users) - Customer who placed the order
    - `provider_name` (text) - Service provider name
    - `provider_logo` (text) - Provider logo URL
    - `provider_color` (text) - Provider brand color
    - `bundle_id` (text) - Data bundle identifier
    - `data_amount` (text) - Amount of data in the bundle
    - `price` (numeric) - Order price
    - `recipient_number` (text) - Phone number receiving the data
    - `mobile_money_number` (text) - Payment phone number
    - `payment_network` (text) - Mobile money network used
    - `status` (text) - Order status: pending, processing, completed, failed
    - `created_at` (timestamptz) - Order creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp
    
  3. Security (RLS Policies)
    - Users can view only their own orders
    - Users can insert their own orders
    - Admins can view all orders
    - Admins can update all orders (including status changes)
    
  4. Important Notes
    - This migration renames the existing purchases table
    - All existing data is preserved
    - Foreign key relationships are maintained
*/

-- Rename the table
ALTER TABLE IF EXISTS purchases RENAME TO orders;

-- Drop old policies (they reference the old table name)
DROP POLICY IF EXISTS "Users can view own purchases" ON orders;
DROP POLICY IF EXISTS "Users can insert own purchases" ON orders;
DROP POLICY IF EXISTS "Users can update own purchases" ON orders;
DROP POLICY IF EXISTS "Admins can view all purchases" ON orders;
DROP POLICY IF EXISTS "Admins can update all purchases" ON orders;

-- Recreate RLS policies with correct names
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);

-- Add comment to table
COMMENT ON TABLE orders IS 'Stores all orders placed by users with full order details and status tracking';
