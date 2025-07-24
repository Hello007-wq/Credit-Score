/*
  # Create Loan Applications Table

  1. New Tables
    - `loan_applications`
      - `id` (uuid, primary key)
      - `applicant_id` (uuid, references profiles)
      - `amount` (decimal)
      - `purpose` (text)
      - `term_months` (integer)
      - `monthly_income` (decimal)
      - `employment_status` (text)
      - `collateral` (text, nullable)
      - `description` (text, nullable)
      - `status` (enum: pending, approved, rejected, under_review)
      - `bank_reviewer_id` (uuid, nullable, references profiles)
      - `review_notes` (text, nullable)
      - `reviewed_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `loan_applications` table
    - Add policies for applicants to read their own applications
    - Add policies for bank users to read all applications
    - Add policies for applicants to create applications
    - Add policies for bank users to update application status
*/

-- Create enum for application status
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'under_review');

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

-- Enable RLS
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create trigger for updated_at
CREATE OR REPLACE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set reviewer and review timestamp
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

-- Create trigger for setting reviewer
CREATE OR REPLACE TRIGGER set_reviewer_on_status_change
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW EXECUTE FUNCTION set_application_reviewer();