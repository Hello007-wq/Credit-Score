/*
  # Create Credit Scores Table

  1. New Tables
    - `credit_scores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `score` (integer, 300-850)
      - `risk_level` (enum: low, medium, high)
      - `payment_history_score` (integer, 0-100)
      - `credit_utilization_score` (integer, 0-100)
      - `credit_history_length_score` (integer, 0-100)
      - `credit_types_score` (integer, 0-100)
      - `new_credit_score` (integer, 0-100)
      - `calculated_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `credit_scores` table
    - Add policies for users to read their own scores
    - Add policies for bank users to read client scores
*/

-- Create enum for risk levels
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

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

-- Enable RLS
ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
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

CREATE POLICY "Only system can insert credit scores"
  ON credit_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Only system can update credit scores"
  ON credit_scores
  FOR UPDATE
  TO authenticated
  USING (false);

-- Create function to calculate risk level based on score
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

-- Create function to generate initial credit score for new clients
CREATE OR REPLACE FUNCTION generate_initial_credit_score()
RETURNS trigger AS $$
DECLARE
  new_score integer;
  calculated_risk risk_level;
BEGIN
  -- Only generate for client users with account numbers
  IF NEW.user_type = 'client' AND NEW.account_number IS NOT NULL THEN
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for generating initial credit scores
CREATE OR REPLACE TRIGGER generate_credit_score_on_profile_update
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.account_number IS NULL AND NEW.account_number IS NOT NULL)
  EXECUTE FUNCTION generate_initial_credit_score();