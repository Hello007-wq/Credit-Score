import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LoanApplication {
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
  applicant_name?: string;
  applicant_email?: string;
  applicant_account_number?: string;
  credit_score?: number;
  risk_level?: 'low' | 'medium' | 'high';
  bank_name?: string;
}

export function useLoanApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;
  
    try {
      setIsLoading(true);
      setError(null);
  
      console.log("Fetching applications for user:", user.id, user.type);
  
      let query = supabase
        .from('loan_applications')
        .select(`
          *,
          banks (
            name
          )
        `);
  
      if (user.type === 'client') {
        query = query.eq('applicant_id', user.id);
      } else if (user.type === 'bank' && user.bankId) {
        query = query.eq('bank_id', user.bankId);
      }
  
      const { data, error: fetchError } = await query.order('created_at', { ascending: false });
  
      if (fetchError) throw fetchError;
  
      const formattedApplications: LoanApplication[] = (data || []).map((app: any) => ({
        ...app,
        bank_name: app.banks?.name ?? 'N/A',
      }));
  
      setApplications(formattedApplications);
    } catch (err) {
      console.error('Error fetching loan applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };
  

  const createApplication = async (applicationData: {
    bank_id: string;
    amount: number;
    purpose: string;
    term_months: number;
    monthly_income: number;
    employment_status: string;
    collateral?: string;
    description?: string;
  }) => {
    if (!user || user.type !== 'client') {
      throw new Error('Only clients can create loan applications');
    }

    if (!applicationData.bank_id) {
      throw new Error('Loan application must include a bank_id');
    }

    try {
      const fullData = {
        applicant_id: user.id,
        updated_at: new Date().toISOString(),
        ...applicationData,
      };

      console.log('Submitting loan application with data:', fullData);

      const { data, error } = await supabase
        .from('loan_applications')
        .insert(fullData)
        .select()
        .single();

      if (error) {
        console.error("Error inserting loan application:", error.message, error.details);
        throw error;
      }

      await fetchApplications(); // Refresh list
      return data;
    } catch (err) {
      console.error('Error creating loan application:', err);
      throw err;
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: 'approved' | 'rejected' | 'under_review',
    reviewNotes?: string
  ) => {
    if (!user || user.type !== 'bank') {
      throw new Error('Only bank users can update application status');
    }

    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({
          status,
          review_notes: reviewNotes,
          bank_reviewer_id: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;

      await fetchApplications();
    } catch (err) {
      console.error('Error updating application status:', err);
      throw err;
    }
  };

  return {
    applications,
    isLoading,
    error,
    createApplication,
    updateApplicationStatus,
    refetch: fetchApplications,
  };
}
