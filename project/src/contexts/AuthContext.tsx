import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'client' | 'bank';
  bank?: string;
  bankId?: string;
  accountNumber?: string;
  creditScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    type: 'client' | 'bank',
    bank?: string,
    accountNumber?: string,
    verificationCode?: string
  ) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    password: string,
    type: 'client' | 'bank',
    bank?: string,
    accountNumber?: string,
    verificationCode?: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  getClientByAccountNumber: (accountNumber: string) => Promise<User | null>;
  getBankList: () => { id: string; name: string; code: string; verificationCode: string }[];
  getVerificationCode: (bankName: string) => string;
  isValidVerificationCode: (bankName: string, code: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const bankVerificationCodes = {
  'CBZ Bank': 'CBZ-VERIFY-2024',
  'Steward Bank': 'STEW-VERIFY-2024',
  'Nedbank Zimbabwe': 'NED-VERIFY-2024',
  'Standard Chartered Bank': 'SCB-VERIFY-2024',
  'First Capital Bank': 'FCB-VERIFY-2024',
  'ZB Bank': 'ZB-VERIFY-2024',
  'BancABC': 'ABC-VERIFY-2024',
  'CABS': 'CABS-VERIFY-2024',
  'Ecobank Zimbabwe': 'ECO-VERIFY-2024',
  'NMB Bank': 'NMB-VERIFY-2024',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    let timeout = setTimeout(() => {
      setIsLoading(false);
      console.warn('Fallback: setIsLoading(false) after timeout');
    }, 3000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          loadUserProfile(session.user).finally(() => clearTimeout(timeout));
        } else {
          setIsLoading(false);
          clearTimeout(timeout);
        }
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (session?.user) {
        // Defer async call to avoid blocking onAuthStateChange callback
        setTimeout(() => {
          loadUserProfile(session.user).finally(() => setIsLoading(false));
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    console.log('loadUserProfile START for user:', supabaseUser.id);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', supabaseUser.id)
        .single();

      console.log('loadUserProfile RESULT:', { profile, error });

      if (error || !profile) {
        console.warn('Profile not found or error:', error);
        setProfileError('Profile not found or error: ' + (error?.message || 'No profile'));
        setUser(null);
        return;
      }

      const userData: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        type: profile.user_type,
        bank: profile.bank_name || undefined,
        bankId: profile.bank_id || undefined,
        accountNumber: profile.account_number || undefined,
        creditScore: profile.credit_scores?.[0]?.score || undefined,
        riskLevel: profile.credit_scores?.[0]?.risk_level || undefined,
        isVerified: profile.is_verified || false,
      };

      setUser(userData);
      setProfileError(null);
    } catch (err) {
      console.error('loadUserProfile CATCH ERROR:', err);
      setProfileError(String(err));
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('loadUserProfile END');
    }
  };

  const login = async (
    email: string,
    password: string,
    type: 'client' | 'bank',
    bank?: string,
    accountNumber?: string,
    verificationCode?: string
  ): Promise<boolean> => {
    console.log('login START');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('signInWithPassword complete:', { data, error });
      if (error) throw new Error(error.message);

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        console.log('Profile fetch:', { profile, profileError });

        if (profileError) throw new Error('Profile not found');
        if (profile?.user_type !== type) throw new Error(`Account is registered as ${profile?.user_type}, not ${type}`);

        if (type === 'client') {
          if (!accountNumber) throw new Error('Account number is required for client login');
          if (profile?.account_number !== accountNumber) throw new Error('Invalid account number');
        }

        if (type === 'bank') {
          if (!bank || !verificationCode) throw new Error('Bank selection and verification code are required');
          const expectedCode = bankVerificationCodes[bank as keyof typeof bankVerificationCodes];
          if (!expectedCode || verificationCode !== expectedCode) throw new Error('Invalid verification code');

          if (!profile?.is_verified || profile?.bank_name !== bank) {
            const { data: bankData } = await supabase.from('banks').select('id').eq('name', bank).single();

            if (bankData) {
              await supabase
                .from('profiles')
                .update({
                  bank_name: bank,
                  bank_id: bankData.id,
                  is_verified: true,
                  verification_code: verificationCode,
                })
                .eq('id', data.user.id);
            }
          }
        }

        console.log('refreshSession START');
        await supabase.auth.refreshSession();
        console.log('refreshSession END');

        await loadUserProfile(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('login END');
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    type: 'client' | 'bank',
    bank?: string,
    accountNumber?: string,
    verificationCode?: string
  ): Promise<boolean> => {
    console.log('signup START');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            user_type: type,
            bank_name: bank,
            account_number: accountNumber,
            verification_code: verificationCode,
          },
        },
      });
      console.log('signUp complete:', { data, error });
      if (error) throw new Error(error.message);

      if (data.user) {
        const profileUpdate: Record<string, unknown> = { user_type: type };

        if (type === 'client' && accountNumber) profileUpdate.account_number = accountNumber;

        if (type === 'bank' && bank) {
          const { data: bankData } = await supabase.from('banks').select('id').eq('name', bank).single();

          if (bankData) {
            profileUpdate.bank_name = bank;
            profileUpdate.bank_id = bankData.id;
            profileUpdate.is_verified = true;
            profileUpdate.verification_code = verificationCode;
          }
        }

        const { data: updatedRows } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', data.user.id)
          .select();

        if (!updatedRows || updatedRows.length === 0) {
          await supabase.from('profiles').insert([{ id: data.user.id, email, name, ...profileUpdate }]);
        }

        console.log('refreshSession START');
        await supabase.auth.refreshSession();
        console.log('refreshSession END');

        await loadUserProfile(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('signup END');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const getClientByAccountNumber = async (accountNumber: string): Promise<User | null> => {
    const { data, error } = await supabase.from('profiles').select(`*`).eq('account_number', accountNumber).eq('user_type', 'client').single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      type: data.user_type,
      accountNumber: data.account_number || undefined,
      creditScore: data.credit_scores?.[0]?.score || undefined,
      riskLevel: data.credit_scores?.[0]?.risk_level || undefined,
    };
  };

  const getBankList = () => [
    { id: '1', name: 'CBZ Bank', code: 'CBZ', verificationCode: 'CBZ-VERIFY-2024' },
    { id: '2', name: 'Steward Bank', code: 'STEW', verificationCode: 'STEW-VERIFY-2024' },
    { id: '3', name: 'Nedbank Zimbabwe', code: 'NED', verificationCode: 'NED-VERIFY-2024' },
    { id: '4', name: 'Standard Chartered Bank', code: 'SCB', verificationCode: 'SCB-VERIFY-2024' },
    { id: '5', name: 'First Capital Bank', code: 'FCB', verificationCode: 'FCB-VERIFY-2024' },
    { id: '6', name: 'ZB Bank', code: 'ZB', verificationCode: 'ZB-VERIFY-2024' },
    { id: '7', name: 'BancABC', code: 'ABC', verificationCode: 'ABC-VERIFY-2024' },
    { id: '8', name: 'CABS', code: 'CABS', verificationCode: 'CABS-VERIFY-2024' },
    { id: '9', name: 'Ecobank Zimbabwe', code: 'ECO', verificationCode: 'ECO-VERIFY-2024' },
    { id: '10', name: 'NMB Bank', code: 'NMB', verificationCode: 'NMB-VERIFY-2024' },
  ];

  const getVerificationCode = (bankName: string) => bankVerificationCodes[bankName as keyof typeof bankVerificationCodes] || '';

  const isValidVerificationCode = (bankName: string, code: string) =>
    bankVerificationCodes[bankName as keyof typeof bankVerificationCodes] === code;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        getClientByAccountNumber,
        getBankList,
        getVerificationCode,
        isValidVerificationCode,
      }}
    >
      {profileError && (
        <div style={{ background: '#fee', color: '#900', padding: '1rem', textAlign: 'center' }}>
          {profileError}{' '}
          <button
            onClick={logout}
            style={{ marginLeft: 8, color: '#00f', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}