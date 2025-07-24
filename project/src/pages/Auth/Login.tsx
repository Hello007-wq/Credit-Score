import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogIn,
  Eye,
  EyeOff,
  CreditCard,
  Building,
  User,
  Hash,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';

const fallbackBankList = [
  { id: 1, name: 'CBZ Bank' },
  { id: 2, name: 'Steward Bank' },
  { id: 3, name: 'Nedbank Zimbabwe' },
  { id: 4, name: 'Standard Chartered Bank' },
  { id: 5, name: 'First Capital Bank' },
  { id: 6, name: 'ZB Bank' },
  { id: 7, name: 'BancABC' },
  { id: 8, name: 'CABS' },
  { id: 9, name: 'Ecobank Zimbabwe' },
  { id: 10, name: 'NMB Bank' },
];

export function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'client' as 'client' | 'bank',
    bank: '',
    accountNumber: '',
    verificationCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, getBankList } = useAuth();
  const navigate = useNavigate();

  const bankList = getBankList() || fallbackBankList;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (formData.userType === 'bank') {
      if (!formData.bank) newErrors.bank = 'Please select your bank';
      if (!formData.verificationCode)
        newErrors.verificationCode = 'Bank verification code is required';
    }

    if (formData.userType === 'client' && !formData.accountNumber) {
      newErrors.accountNumber = 'Account number is required for client login';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(
        formData.email,
        formData.password,
        formData.userType,
        formData.userType === 'bank' ? formData.bank : undefined,
        formData.userType === 'client' ? formData.accountNumber : undefined,
        formData.userType === 'bank'
          ? formData.verificationCode
          : undefined
      );

      if (success) {
        navigate(
          formData.userType === 'client'
            ? '/client-dashboard'
            : '/bank-dashboard'
        );
      }
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Login failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-500 p-3 rounded-full">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Secure Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your CreditScore Pro account with enhanced security
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* User type switcher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      userType: 'client',
                      bank: '',
                      verificationCode: '',
                    }))
                  }
                  className={`p-4 rounded-lg border-2 ${
                    formData.userType === 'client'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Individual</div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      userType: 'bank',
                      accountNumber: '',
                    }))
                  }
                  className={`p-4 rounded-lg border-2 ${
                    formData.userType === 'bank'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Bank</div>
                </button>
              </div>
            </div>

            {formData.userType === 'client' && (
              <div className="relative">
                <Input
                  label="Account Number"
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  error={errors.accountNumber}
                  placeholder="e.g., ACC001234567"
                />
                <Hash className="absolute right-3 top-9 h-5 w-5 text-gray-400" />
              </div>
            )}

            {formData.userType === 'bank' && (
              <>
                <div>
                  <label
                    htmlFor="bank"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select Your Bank
                  </label>
                  <select
                    id="bank"
                    name="bank"
                    value={formData.bank}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 ${
                      errors.bank ? 'border-error-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Choose your bank...</option>
                    {bankList.map((bank) => (
                      <option key={bank.id} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  {errors.bank && (
                    <p className="text-sm text-error-500 mt-1">
                      {errors.bank}
                    </p>
                  )}
                </div>

                <Input
                  label="Bank Verification Code"
                  type="text"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  error={errors.verificationCode}
                  placeholder="Enter your verification code"
                  helperText="Contact your admin for your code"
                />
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              {formData.userType === 'client' ? (
                <p>Your account number is required for secure access.</p>
              ) : (
                <>
                  <p>Bank representatives require verification codes.</p>
                  <p className="mt-2 font-medium">Examples:</p>
                  <ul className="list-disc ml-5 text-xs mt-1">
                    <li>CBZ Bank: CBZ-VERIFY-2024</li>
                    <li>Steward Bank: STEW-VERIFY-2024</li>
                    <li>Nedbank: NED-VERIFY-2024</li>
                    <li>Standard Chartered: SCB-VERIFY-2024</li>
                  </ul>
                  <p className="mt-2">
                    <Link
                      to="/admin"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Administrator Dashboard →
                    </Link>
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Signing in...
                </div>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Secure Sign In
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
