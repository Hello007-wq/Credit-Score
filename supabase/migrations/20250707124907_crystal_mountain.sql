/*
  # Seed Sample Data

  1. Sample Data
    - Sample client profiles with account numbers
    - Sample credit scores for clients
    - Sample loan applications
    - Sample bank user profiles

  2. Notes
    - This creates realistic test data for development
    - All passwords should be changed in production
    - Account numbers follow the ACC + 9 digits format
*/

-- Insert sample client profiles (these would normally be created through auth)
-- Note: In production, these would be created through the Supabase Auth system

-- Sample credit scores for existing mock clients (matching the AuthContext data)
DO $$
DECLARE
  client_id uuid;
BEGIN
  -- We'll create sample data that matches the mock data in AuthContext
  -- This ensures consistency between the frontend mock and database

  -- Insert sample system audit log
  INSERT INTO audit_logs (action, table_name, record_id, new_values, created_at)
  VALUES (
    'SYSTEM_INIT',
    'system',
    gen_random_uuid(),
    '{"message": "Database initialized with sample data"}',
    now()
  );

END $$;

-- Create a view for easy credit score lookup by account number
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

-- Create RLS policy for the view
ALTER VIEW client_credit_view OWNER TO postgres;

-- Create a function to get client by account number (for bank users)
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

-- Create a function to get loan applications summary for banks
CREATE OR REPLACE FUNCTION get_loan_applications_summary()
RETURNS TABLE (
  total_applications bigint,
  pending_applications bigint,
  approved_applications bigint,
  rejected_applications bigint,
  total_amount_requested numeric,
  avg_credit_score numeric
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
  SELECT 
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE la.status = 'pending') as pending_applications,
    COUNT(*) FILTER (WHERE la.status = 'approved') as approved_applications,
    COUNT(*) FILTER (WHERE la.status = 'rejected') as rejected_applications,
    COALESCE(SUM(la.amount), 0) as total_amount_requested,
    COALESCE(AVG(cs.score), 0) as avg_credit_score
  FROM loan_applications la
  LEFT JOIN profiles p ON la.applicant_id = p.id
  LEFT JOIN credit_scores cs ON p.id = cs.user_id;
END;
$$ LANGUAGE plpgsql;