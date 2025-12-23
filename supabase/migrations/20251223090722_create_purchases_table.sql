/*
  # Create purchases table

  1. New Tables
    - `purchases`
      - `id` (uuid, primary key) - Unique identifier for each purchase
      - `user_id` (uuid, foreign key to auth.users) - The user who made the purchase
      - `provider_name` (text) - Name of the telecom provider (MTN, Vodafone, etc.)
      - `provider_logo` (text) - URL to provider logo
      - `provider_color` (text) - Provider brand color
      - `bundle_id` (text) - ID of the bundle purchased
      - `data_amount` (text) - Amount of data in the bundle (e.g., "10GB")
      - `price` (numeric) - Price paid for the bundle
      - `recipient_number` (text) - Phone number receiving the data bundle
      - `mobile_money_number` (text) - Mobile money number used for payment
      - `payment_network` (text) - Mobile money network used (MTN, Vodafone, AirtelTigo)
      - `status` (text) - Payment status (pending, completed, failed)
      - `created_at` (timestamptz) - When the purchase was made
      - `updated_at` (timestamptz) - When the record was last updated

  2. Security
    - Enable RLS on `purchases` table
    - Add policy for authenticated users to read their own purchases
    - Add policy for authenticated users to create their own purchases
    - Add policy for authenticated users to update their own purchases
*/

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_name text NOT NULL,
  provider_logo text NOT NULL,
  provider_color text NOT NULL,
  bundle_id text NOT NULL,
  data_amount text NOT NULL,
  price numeric NOT NULL,
  recipient_number text NOT NULL,
  mobile_money_number text NOT NULL,
  payment_network text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases"
  ON purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchases"
  ON purchases
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases(user_id);
CREATE INDEX IF NOT EXISTS purchases_status_idx ON purchases(status);
CREATE INDEX IF NOT EXISTS purchases_created_at_idx ON purchases(created_at DESC);
