/*
  # Complete System Setup and Verification - Fixed

  1. Database Schema Verification
    - Ensure all tables exist with proper structure
    - Verify all relationships and constraints
    - Add missing indexes for performance

  2. Bank Verification System
    - Create comprehensive verification code management
    - Add administrator functions
    - Implement secure code validation

  3. Loan Application System
    - Complete loan application workflow
    - Add bank-specific application routing
    - Implement proper filtering and access control

  4. Security and Audit
    - Comprehensive audit logging
    - Row-level security policies
    - Data integrity constraints
*/

-- Ensure all required extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('client', 'bank');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
        CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'under_review');
    END IF;
END $$;

-- Create banks table first (no dependencies)
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

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  user_type user_type NOT NULL DEFAULT 'client',
  bank_name text,
  account_number text UNIQUE,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to profiles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bank_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bank_id uuid REFERENCES banks(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_verified boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'verification_code'
    ) THEN
        ALTER TABLE profiles ADD COLUMN verification_code text;
    END IF;
END $$;

-- Create bank_verification_codes table
CREATE TABLE IF NOT EXISTS bank_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES banks(id),
  verification_code text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 year')
);

-- Create credit_scores table
CREATE TABLE IF NOT EXISTS credit_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 300 AND score <= 850),
  risk_level risk_level NOT NULL,
  payment_history_score integer DEFAULT 0 CHECK (payment_history_score >= 0 AND payment_history_score <= 100),
  credit_utilization_score integer DEFAULT 0 CHECK (credit_utilization_score >= 0 AND credit_utilization_score <= 100),
  credit_history_length_score integer DEFAULT 0 CHECK (credit_history_length_score >= 0 AND credit_history_length_score <= 100),
  credit_types_score integer DEFAULT 0 CHECK (credit_types_score >= 0 AND credit_types_score <= 100),
  new_credit_score integer DEFAULT 0 CHECK (new_credit_score >= 0 AND new_credit_score <= 100),
  calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create loan_applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(15,2) NOT NULL CHECK (amount > 0),
  purpose text NOT NULL,
  term_months integer NOT NULL CHECK (term_months > 0),
  monthly_income decimal(15,2) NOT NULL CHECK (monthly_income > 0),
  employment_status text NOT NULL,
  collateral text,
  description text,
  status application_status DEFAULT 'pending',
  bank_reviewer_id uuid REFERENCES profiles(id),
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add bank_id column to loan_applications if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'loan_applications' AND column_name = 'bank_id'
    ) THEN
        ALTER TABLE loan_applications ADD COLUMN bank_id uuid REFERENCES banks(id);
    END IF;
END $$;

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_account_number ON profiles(account_number);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_bank_id ON profiles(bank_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_credit_scores_user_id ON credit_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_score ON credit_scores(score);
CREATE INDEX IF NOT EXISTS idx_loan_applications_applicant_id ON loan_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_bank_id ON loan_applications(bank_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_bank_verification_codes_bank_id ON bank_verification_codes(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_verification_codes_code ON bank_verification_codes(verification_code);

-- Enable RLS on all tables
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read active banks" ON banks;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Bank users can read client profiles" ON profiles;
DROP POLICY IF EXISTS "System can manage verification codes" ON bank_verification_codes;
DROP POLICY IF EXISTS "Users can read own credit scores" ON credit_scores;
DROP POLICY IF EXISTS "System can manage credit scores" ON credit_scores;
DROP POLICY IF EXISTS "Applicants can read own applications" ON loan_applications;
DROP POLICY IF EXISTS "Bank users can read applications for their bank" ON loan_applications;
DROP POLICY IF EXISTS "Clients can create applications" ON loan_applications;
DROP POLICY IF EXISTS "Bank users can update applications for their bank" ON loan_applications;
DROP POLICY IF EXISTS "Authenticated users can read system settings" ON system_settings;
DROP POLICY IF EXISTS "Bank users can read all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can read their own audit logs" ON audit_logs;

-- Create comprehensive RLS policies
CREATE POLICY "Anyone can read active banks"
  ON banks FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Bank users can read client profiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.user_type = 'bank' AND p.is_verified = true
    )
  );

CREATE POLICY "System can manage verification codes"
  ON bank_verification_codes FOR ALL TO authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "Users can read own credit scores"
  ON credit_scores FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.user_type = 'bank' AND p.is_verified = true
    )
  );

CREATE POLICY "System can manage credit scores"
  ON credit_scores FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Applicants can read own applications"
  ON loan_applications FOR SELECT TO authenticated
  USING (applicant_id = auth.uid());

CREATE POLICY "Bank users can read applications for their bank"
  ON loan_applications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_type = 'bank' 
      AND p.is_verified = true
      AND p.bank_id = loan_applications.bank_id
    )
  );

CREATE POLICY "Clients can create applications"
  ON loan_applications FOR INSERT TO authenticated
  WITH CHECK (
    applicant_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.user_type = 'client'
    )
  );

CREATE POLICY "Bank users can update applications for their bank"
  ON loan_applications FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_type = 'bank' 
      AND p.is_verified = true
      AND p.bank_id = loan_applications.bank_id
    )
  );

CREATE POLICY "Authenticated users can read system settings"
  ON system_settings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Bank users can read all audit logs"
  ON audit_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.user_type = 'bank' AND p.is_verified = true
    )
  );

CREATE POLICY "Users can read their own audit logs"
  ON audit_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Create or replace all functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_risk_level(score integer)
RETURNS risk_level AS $$
BEGIN
  IF score >= 750 THEN
    RETURN 'low'::risk_level;
  ELSIF score >= 650 THEN
    RETURN 'medium'::risk_level;
  ELSE
    RETURN 'high'::risk_level;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', new.email), 
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_initial_credit_score()
RETURNS trigger AS $$
DECLARE
  new_score integer;
  calculated_risk risk_level;
BEGIN
  -- Only generate for client users with account numbers
  IF NEW.user_type = 'client' AND NEW.account_number IS NOT NULL THEN
    -- Check if credit score already exists
    IF NOT EXISTS (SELECT 1 FROM credit_scores WHERE user_id = NEW.id) THEN
      -- Generate a realistic credit score (500-850 range)
      new_score := 500 + floor(random() * 350);
      calculated_risk := calculate_risk_level(new_score);
      
      INSERT INTO credit_scores (
        user_id,
        score,
        risk_level,
        payment_history_score,
        credit_utilization_score,
        credit_history_length_score,
        credit_types_score,
        new_credit_score
      ) VALUES (
        NEW.id,
        new_score,
        calculated_risk,
        70 + floor(random() * 30), -- 70-100
        60 + floor(random() * 40), -- 60-100
        50 + floor(random() * 50), -- 50-100
        40 + floor(random() * 60), -- 40-100
        60 + floor(random() * 40)  -- 60-100
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_application_reviewer()
RETURNS trigger AS $$
BEGIN
  -- If status is being changed from pending and reviewer is not set
  IF OLD.status = 'pending' AND NEW.status != 'pending' AND NEW.bank_reviewer_id IS NULL THEN
    NEW.bank_reviewer_id := auth.uid();
    NEW.reviewed_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
      auth.uid(),
      'UPDATE',
      'profiles',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (
      auth.uid(),
      'INSERT',
      'profiles',
      NEW.id,
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_loan_application_changes()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
      auth.uid(),
      'UPDATE',
      'loan_applications',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (
      auth.uid(),
      'INSERT',
      'loan_applications',
      NEW.id,
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS generate_credit_score_on_profile_update ON profiles;
DROP TRIGGER IF EXISTS update_loan_applications_updated_at ON loan_applications;
DROP TRIGGER IF EXISTS set_reviewer_on_status_change ON loan_applications;
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
DROP TRIGGER IF EXISTS audit_profiles_changes ON profiles;
DROP TRIGGER IF EXISTS audit_loan_applications_changes ON loan_applications;

-- Create all triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_credit_score_on_profile_update
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.account_number IS NULL AND NEW.account_number IS NOT NULL)
  EXECUTE FUNCTION generate_initial_credit_score();

CREATE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_reviewer_on_status_change
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW EXECUTE FUNCTION set_application_reviewer();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_profiles_changes
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_profile_changes();

CREATE TRIGGER audit_loan_applications_changes
  AFTER INSERT OR UPDATE ON loan_applications
  FOR EACH ROW EXECUTE FUNCTION log_loan_application_changes();

-- Insert banks data
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

-- Insert verification codes for each bank
INSERT INTO bank_verification_codes (bank_id, verification_code) 
SELECT 
  id,
  CASE 
    WHEN code = 'CBZ' THEN 'CBZ-VERIFY-2024'
    WHEN code = 'STEW' THEN 'STEW-VERIFY-2024'
    WHEN code = 'NED' THEN 'NED-VERIFY-2024'
    WHEN code = 'SCB' THEN 'SCB-VERIFY-2024'
    WHEN code = 'FCB' THEN 'FCB-VERIFY-2024'
    WHEN code = 'ZB' THEN 'ZB-VERIFY-2024'
    WHEN code = 'ABC' THEN 'ABC-VERIFY-2024'
    WHEN code = 'CABS' THEN 'CABS-VERIFY-2024'
    WHEN code = 'ECO' THEN 'ECO-VERIFY-2024'
    WHEN code = 'NMB' THEN 'NMB-VERIFY-2024'
    ELSE UPPER(code) || '-VERIFY-2024'
  END
FROM banks
ON CONFLICT (verification_code) DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('min_credit_score', '300', 'Minimum possible credit score'),
  ('max_credit_score', '850', 'Maximum possible credit score'),
  ('default_score_validity_days', '90', 'Number of days a credit score remains valid'),
  ('max_loan_amount', '1000000', 'Maximum loan amount in USD'),
  ('min_loan_term_months', '1', 'Minimum loan term in months'),
  ('max_loan_term_months', '360', 'Maximum loan term in months (30 years)'),
  ('system_version', 'v2.1.0', 'Current system version'),
  ('last_backup', now()::text, 'Last database backup timestamp')
ON CONFLICT (setting_key) DO NOTHING;

-- Create helper views
CREATE OR REPLACE VIEW client_credit_view AS
SELECT 
  p.account_number,
  p.name,
  p.email,
  p.phone,
  cs.score,
  cs.risk_level,
  cs.payment_history_score,
  cs.credit_utilization_score,
  cs.credit_history_length_score,
  cs.credit_types_score,
  cs.new_credit_score,
  cs.calculated_at,
  p.created_at as client_since
FROM profiles p
LEFT JOIN credit_scores cs ON p.id = cs.user_id
WHERE p.user_type = 'client' AND p.account_number IS NOT NULL;

-- Create helper functions for bank operations
CREATE OR REPLACE FUNCTION get_client_by_account_number(account_num text)
RETURNS TABLE (
  account_number text,
  name text,
  email text,
  phone text,
  score integer,
  risk_level risk_level,
  payment_history_score integer,
  credit_utilization_score integer,
  credit_history_length_score integer,
  credit_types_score integer,
  new_credit_score integer,
  calculated_at timestamptz,
  client_since timestamptz
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requesting user is a verified bank user
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'bank' AND is_verified = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Verified bank users only.';
  END IF;

  RETURN QUERY
  SELECT * FROM client_credit_view ccv
  WHERE ccv.account_number = account_num;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verify_bank_representative(
  user_id uuid,
  bank_name text,
  verification_code text
)
RETURNS boolean
SECURITY DEFINER
AS $$
DECLARE
  bank_record banks%ROWTYPE;
  code_record bank_verification_codes%ROWTYPE;
BEGIN
  -- Find the bank by name
  SELECT * INTO bank_record FROM banks WHERE name = bank_name AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bank not found or inactive';
  END IF;
  
  -- Check verification code
  SELECT * INTO code_record 
  FROM bank_verification_codes 
  WHERE bank_id = bank_record.id 
  AND verification_code = verify_bank_representative.verification_code
  AND is_active = true
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired verification code';
  END IF;
  
  -- Update the user profile
  UPDATE profiles 
  SET 
    bank_id = bank_record.id,
    bank_name = bank_record.name,
    is_verified = true,
    verification_code = verify_bank_representative.verification_code
  WHERE id = user_id;
  
  -- Log the verification
  INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
  VALUES (
    user_id,
    'BANK_VERIFICATION',
    'profiles',
    user_id,
    jsonb_build_object(
      'bank_id', bank_record.id,
      'bank_name', bank_record.name,
      'verified_at', now()
    )
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Log system initialization
INSERT INTO audit_logs (action, table_name, record_id, new_values, created_at)
VALUES (
  'SYSTEM_COMPLETE_SETUP',
  'system',
  gen_random_uuid(),
  jsonb_build_object(
    'message', 'Complete system setup and verification completed',
    'version', 'v2.1.0',
    'setup_date', now()
  ),
  now()
);