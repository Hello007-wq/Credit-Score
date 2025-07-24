/*
  # Enhance Loan System with Bank Selection and Verification

  1. Schema Updates
    - Add bank_id to loan_applications table
    - Add bank_id to profiles table for bank representatives
    - Add verification status for bank representatives
    - Create bank_representatives table for verification

  2. Security
    - Update RLS policies for bank-specific access
    - Add verification checks for bank representatives
    - Ensure clients can only see their own applications
    - Bank reps can only see applications for their bank

  3. Functions
    - Add bank verification functions
    - Update application filtering by bank
*/

-- Add bank_id to profiles table for bank representatives
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bank_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bank_id uuid REFERENCES banks(id);
  END IF;
END $$;

-- Add verification status for bank representatives
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_verified boolean DEFAULT false;
  END IF;
END $$;

-- Add verification code for bank representatives
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_code text;
  END IF;
END $$;

-- Add bank_id to loan_applications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loan_applications' AND column_name = 'bank_id'
  ) THEN
    ALTER TABLE loan_applications ADD COLUMN bank_id uuid REFERENCES banks(id);
  END IF;
END $$;

-- Create bank_verification_codes table for secure verification
CREATE TABLE IF NOT EXISTS bank_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES banks(id),
  verification_code text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 year')
);

-- Enable RLS on bank_verification_codes
ALTER TABLE bank_verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for bank verification codes (only system can manage)
CREATE POLICY "System can manage verification codes"
  ON bank_verification_codes
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

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

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Bank users can read client profiles" ON profiles;
CREATE POLICY "Bank users can read client profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.user_type = 'bank' AND p.is_verified = true
    )
  );

-- Update RLS policies for loan_applications
DROP POLICY IF EXISTS "Bank users can read all applications" ON loan_applications;
DROP POLICY IF EXISTS "Bank users can update applications" ON loan_applications;

CREATE POLICY "Bank users can read applications for their bank"
  ON loan_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_type = 'bank' 
      AND p.is_verified = true
      AND p.bank_id = loan_applications.bank_id
    )
  );

CREATE POLICY "Bank users can update applications for their bank"
  ON loan_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_type = 'bank' 
      AND p.is_verified = true
      AND p.bank_id = loan_applications.bank_id
    )
  );

-- Update RLS policies for credit_scores
DROP POLICY IF EXISTS "Users can read own credit scores" ON credit_scores;
CREATE POLICY "Users can read own credit scores"
  ON credit_scores
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_type = 'bank' 
      AND p.is_verified = true
    )
  );

-- Create function to verify bank representative
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

-- Create function to get applications for a specific bank
CREATE OR REPLACE FUNCTION get_bank_applications(requesting_user_id uuid)
RETURNS TABLE (
  id uuid,
  applicant_name text,
  applicant_email text,
  applicant_account_number text,
  amount decimal,
  purpose text,
  term_months integer,
  monthly_income decimal,
  employment_status text,
  collateral text,
  description text,
  status application_status,
  credit_score integer,
  risk_level risk_level,
  created_at timestamptz,
  updated_at timestamptz
)
SECURITY DEFINER
AS $$
DECLARE
  user_bank_id uuid;
BEGIN
  -- Get the bank ID for the requesting user
  SELECT bank_id INTO user_bank_id
  FROM profiles 
  WHERE profiles.id = requesting_user_id 
  AND user_type = 'bank' 
  AND is_verified = true;
  
  IF user_bank_id IS NULL THEN
    RAISE EXCEPTION 'Access denied. Verified bank representative required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    la.id,
    p.name as applicant_name,
    p.email as applicant_email,
    p.account_number as applicant_account_number,
    la.amount,
    la.purpose,
    la.term_months,
    la.monthly_income,
    la.employment_status,
    la.collateral,
    la.description,
    la.status,
    cs.score as credit_score,
    cs.risk_level,
    la.created_at,
    la.updated_at
  FROM loan_applications la
  JOIN profiles p ON la.applicant_id = p.id
  LEFT JOIN credit_scores cs ON p.id = cs.user_id
  WHERE la.bank_id = user_bank_id
  ORDER BY la.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get bank statistics
CREATE OR REPLACE FUNCTION get_bank_statistics(requesting_user_id uuid)
RETURNS TABLE (
  total_applications bigint,
  pending_applications bigint,
  approved_applications bigint,
  rejected_applications bigint,
  total_amount_requested numeric,
  avg_credit_score numeric,
  approval_rate numeric
)
SECURITY DEFINER
AS $$
DECLARE
  user_bank_id uuid;
BEGIN
  -- Get the bank ID for the requesting user
  SELECT bank_id INTO user_bank_id
  FROM profiles 
  WHERE profiles.id = requesting_user_id 
  AND user_type = 'bank' 
  AND is_verified = true;
  
  IF user_bank_id IS NULL THEN
    RAISE EXCEPTION 'Access denied. Verified bank representative required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE la.status = 'pending') as pending_applications,
    COUNT(*) FILTER (WHERE la.status = 'approved') as approved_applications,
    COUNT(*) FILTER (WHERE la.status = 'rejected') as rejected_applications,
    COALESCE(SUM(la.amount), 0) as total_amount_requested,
    COALESCE(AVG(cs.score), 0) as avg_credit_score,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE la.status = 'approved')::numeric / COUNT(*)::numeric) * 100, 2)
      ELSE 0 
    END as approval_rate
  FROM loan_applications la
  LEFT JOIN profiles p ON la.applicant_id = p.id
  LEFT JOIN credit_scores cs ON p.id = cs.user_id
  WHERE la.bank_id = user_bank_id;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_bank_id ON profiles(bank_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_loan_applications_bank_id ON loan_applications(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_verification_codes_bank_id ON bank_verification_codes(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_verification_codes_code ON bank_verification_codes(verification_code);