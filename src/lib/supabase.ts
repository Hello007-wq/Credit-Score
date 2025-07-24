import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  console.log("Supabase URL:", supabaseUrl);
  console.log("Supabase Anon Key:", supabaseAnonKey ? "Present" : "Missing");
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          user_type: 'client' | 'bank';
          bank_name: string | null;
          bank_id: string | null;
          account_number: string | null;
          phone: string | null;
          address: string | null;
          is_verified: boolean;
          verification_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          user_type?: 'client' | 'bank';
          bank_name?: string | null;
          bank_id?: string | null;
          account_number?: string | null;
          phone?: string | null;
          address?: string | null;
          is_verified?: boolean;
          verification_code?: string | null;
        };
        Update: {
          name?: string;
          email?: string;
          user_type?: 'client' | 'bank';
          bank_name?: string | null;
          bank_id?: string | null;
          account_number?: string | null;
          phone?: string | null;
          address?: string | null;
          is_verified?: boolean;
          verification_code?: string | null;
        };
      };
      banks: {
        Row: {
          id: string;
          name: string;
          code: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          is_active: boolean;
          created_at: string;
        };
      };
      credit_scores: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          risk_level: 'low' | 'medium' | 'high';
          payment_history_score: number;
          credit_utilization_score: number;
          credit_history_length_score: number;
          credit_types_score: number;
          new_credit_score: number;
          calculated_at: string;
          created_at: string;
        };
      };
      loan_applications: {
        Row: {
          id: string;
          applicant_id: string;
          bank_id: string | null;
          amount: number;
          purpose: string;
          term_months: number;
          monthly_income: number;
          employment_status: string;
          collateral: string | null;
          description: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'under_review';
          bank_reviewer_id: string | null;
          review_notes: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          applicant_id: string;
          bank_id?: string | null;
          amount: number;
          purpose: string;
          term_months: number;
          monthly_income: number;
          employment_status: string;
          collateral?: string | null;
          description?: string | null;
        };
      };
    };
  };
}