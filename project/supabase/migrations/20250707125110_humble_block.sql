/*
  # Fix Database Schema Errors

  1. Fix any syntax errors in the database schema
  2. Ensure all constraints and relationships work properly
  3. Add missing indexes for performance
  4. Fix any RLS policy issues
*/

-- Fix any potential enum conflicts by dropping and recreating if needed
DO $$ 
BEGIN
    -- Check if enums exist and create them if they don't
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

-- Ensure all tables exist with proper structure
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

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_account_number ON profiles(account_number);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_credit_scores_user_id ON credit_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_score ON credit_scores(score);
CREATE INDEX IF NOT EXISTS idx_loan_applications_applicant_id ON loan_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Bank users can read client profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own credit scores" ON credit_scores;
DROP POLICY IF EXISTS "Only system can insert credit scores" ON credit_scores;
DROP POLICY IF EXISTS "Only system can update credit scores" ON credit_scores;
DROP POLICY IF EXISTS "Applicants can read own applications" ON loan_applications;
DROP POLICY IF EXISTS "Bank users can read all applications" ON loan_applications;
DROP POLICY IF EXISTS "Clients can create applications" ON loan_applications;
DROP POLICY IF EXISTS "Bank users can update applications" ON loan_applications;
DROP POLICY IF EXISTS "Anyone can read active banks" ON banks;
DROP POLICY IF EXISTS "Authenticated users can read system settings" ON system_settings;
DROP POLICY IF EXISTS "Bank users can read all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can read their own audit logs" ON audit_logs;

-- Create RLS policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Bank users can read client profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.user_type = 'bank'
    )
  );

CREATE POLICY "Users can read own credit scores"
  ON credit_scores
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.user_type = 'bank'
    )
  );

CREATE POLICY "System can manage credit scores"
  ON credit_scores
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Applicants can read own applications"
  ON loan_applications
  FOR SELECT
  TO authenticated
  USING (applicant_id = auth.uid());

CREATE POLICY "Bank users can read all applications"
  ON loan_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.user_type = 'bank'
    )
  );

CREATE POLICY "Clients can create applications"
  ON loan_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    applicant_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.user_type = 'client'
    )
  );

CREATE POLICY "Bank users can update applications"
  ON loan_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.user_type = 'bank'
    )
  );

CREATE POLICY "Anyone can read active banks"
  ON banks
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can read system settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Bank users can read all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.user_type = 'bank'
    )
  );

CREATE POLICY "Users can read their own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create or replace functions
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

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS generate_credit_score_on_profile_update ON profiles;
DROP TRIGGER IF EXISTS update_loan_applications_updated_at ON loan_applications;
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;

-- Create triggers
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

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert banks data if not exists
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

-- Insert system settings if not exists
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('min_credit_score', '300', 'Minimum possible credit score'),
  ('max_credit_score', '850', 'Maximum possible credit score'),
  ('default_score_validity_days', '90', 'Number of days a credit score remains valid'),
  ('max_loan_amount', '1000000', 'Maximum loan amount in USD'),
  ('min_loan_term_months', '1', 'Minimum loan term in months'),
  ('max_loan_term_months', '360', 'Maximum loan term in months (30 years)')
ON CONFLICT (setting_key) DO NOTHING;

-- Create helper view for client credit lookup
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

-- Create helper function for bank users to lookup clients
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
  -- Check if the requesting user is a bank user
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'bank'
  ) THEN
    RAISE EXCEPTION 'Access denied. Bank users only.';
  END IF;

  RETURN QUERY
  SELECT * FROM client_credit_view ccv
  WHERE ccv.account_number = account_num;
END;
$$ LANGUAGE plpgsql;