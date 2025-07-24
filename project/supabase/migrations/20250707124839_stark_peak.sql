/*
  # Create Banks and System Settings Tables

  1. New Tables
    - `banks`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `code` (text, unique)
      - `address` (text)
      - `phone` (text)
      - `email` (text)
      - `website` (text, nullable)
      - `is_active` (boolean)
      - `created_at` (timestamp)

    - `system_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique)
      - `setting_value` (text)
      - `description` (text)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for reading bank information
    - Add policies for system settings access
*/

-- Create banks table
CREATE TABLE IF NOT EXISTS banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  address text,
  phone text,
  email text,
  website text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for banks
CREATE POLICY "Anyone can read active banks"
  ON banks
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create policies for system_settings
CREATE POLICY "Authenticated users can read system settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert Zimbabwe banks
INSERT INTO banks (name, code, address, phone, email) VALUES
  ('CBZ Bank', 'CBZ', 'CBZ Centre, Corner First Street & Nelson Mandela Avenue, Harare', '+263-4-758800', 'info@cbz.co.zw'),
  ('Steward Bank', 'STEW', 'Steward Bank Building, 76 Samora Machel Avenue, Harare', '+263-4-786801', 'info@stewardbank.co.zw'),
  ('Nedbank Zimbabwe', 'NED', 'Nedbank Centre, Corner First Street & Jason Moyo Avenue, Harare', '+263-4-758600', 'info@nedbank.co.zw'),
  ('Standard Chartered Bank', 'SCB', 'Standard Chartered Centre, 67 Samora Machel Avenue, Harare', '+263-4-758400', 'info@sc.com'),
  ('First Capital Bank', 'FCB', 'First Capital Centre, 15 Phillips Avenue, Belgravia, Harare', '+263-4-369000', 'info@firstcapitalbank.co.zw'),
  ('ZB Bank', 'ZB', 'ZB Centre, Corner First Street & Kwame Nkrumah Avenue, Harare', '+263-4-758830', 'info@zb.co.zw'),
  ('BancABC', 'ABC', 'BancABC Centre, Corner Jason Moyo Avenue & Second Street, Harare', '+263-4-369400', 'info@bancabc.com'),
  ('CABS', 'CABS', 'CABS Centre, Corner Nelson Mandela Avenue & Fourth Street, Harare', '+263-4-758580', 'info@cabs.co.zw'),
  ('Ecobank Zimbabwe', 'ECO', 'Ecobank Centre, 69 Samora Machel Avenue, Harare', '+263-4-758900', 'info@ecobank.com'),
  ('NMB Bank', 'NMB', 'NMB Centre, Corner Speke Avenue & Julius Nyerere Way, Harare', '+263-4-758700', 'info@nmbz.co.zw')
ON CONFLICT (name) DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('min_credit_score', '300', 'Minimum possible credit score'),
  ('max_credit_score', '850', 'Maximum possible credit score'),
  ('default_score_validity_days', '90', 'Number of days a credit score remains valid'),
  ('max_loan_amount', '1000000', 'Maximum loan amount in USD'),
  ('min_loan_term_months', '1', 'Minimum loan term in months'),
  ('max_loan_term_months', '360', 'Maximum loan term in months (30 years)')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for system_settings updated_at
CREATE OR REPLACE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();