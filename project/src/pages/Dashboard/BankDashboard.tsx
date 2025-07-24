import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  FileText,
  Search,
  BarChart3,
  PieChart,
  Hash,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useAuth } from '../../contexts/AuthContext';

interface Application {
  id: number;
  name: string;
  amount: number;
  creditScore: number;
  status: 'approved' | 'pending' | 'review' | string;
  riskLevel: 'low' | 'medium' | 'high' | string;
  date: string;
  purpose: string;
  accountNumber: string;
  bank: string;
}

interface Client extends Application {}

export function BankDashboard() {
  const { user, getClientByAccountNumber } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'credit-lookup' | 'applications' | 'analytics' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [accountLookup, setAccountLookup] = useState('');
  const [lookupResult, setLookupResult] = useState<Client | null>(null);
  const [lookupError, setLookupError] = useState('');

  const isVerified = user?.isVerified ?? false;

  // Mock stats
  const stats = {
    totalApplications: isVerified ? 245 : 0,
    approvedLoans: isVerified ? 189 : 0,
    pendingReview: isVerified ? 34 : 0,
    totalAmount: isVerified ? 12500000 : 0,
    avgCreditScore: isVerified ? 725 : 0,
    approvalRate: isVerified ? 77 : 0,
  };

  // Mock recent applications filtered by user bank
  const recentApplications: Application[] = isVerified
    ? [
        {
          id: 1,
          name: 'John Mukamuri',
          amount: 50000,
          creditScore: 785,
          status: 'pending',
          riskLevel: 'low',
          date: '2024-01-20',
          purpose: 'Home Purchase',
          accountNumber: 'ACC001234567',
          bank: user?.bank || 'CBZ Bank',
        },
        {
          id: 2,
          name: 'Sarah Moyo',
          amount: 25000,
          creditScore: 692,
          status: 'approved',
          riskLevel: 'medium',
          date: '2024-01-19',
          purpose: 'Vehicle',
          accountNumber: 'ACC001234568',
          bank: user?.bank || 'CBZ Bank',
        },
        {
          id: 3,
          name: 'David Chikwanha',
          amount: 75000,
          creditScore: 845,
          status: 'approved',
          riskLevel: 'low',
          date: '2024-01-18',
          purpose: 'Business Expansion',
          accountNumber: 'ACC001234569',
          bank: user?.bank || 'CBZ Bank',
        },
        {
          id: 4,
          name: 'Grace Madziva',
          amount: 30000,
          creditScore: 620,
          status: 'review',
          riskLevel: 'high',
          date: '2024-01-17',
          purpose: 'Debt Consolidation',
          accountNumber: 'ACC001234570',
          bank: user?.bank || 'CBZ Bank',
        },
      ].filter((app) => app.bank === user?.bank)
    : [];

  const creditDistribution = [
    { range: '800-850', count: 45, percentage: 18 },
    { range: '750-799', count: 78, percentage: 32 },
    { range: '700-749', count: 65, percentage: 27 },
    { range: '650-699', count: 32, percentage: 13 },
    { range: '600-649', count: 18, percentage: 7 },
    { range: 'Below 600', count: 7, percentage: 3 },
  ];

  // Lookup handler
  const handleAccountLookup = () => {
    setLookupError('');
    setLookupResult(null);

    if (!accountLookup.trim()) {
      setLookupError('Please enter an account number');
      return;
    }

    const client = getClientByAccountNumber(accountLookup.trim());
    if (client) {
      setLookupResult(client);
    } else {
      setLookupError('Account number not found in our system');
    }
  };

  // Status color helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800';
      case 'pending':
        return 'bg-warning-100 text-warning-800';
      case 'review':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-success-600';
    if (score >= 650) return 'text-warning-600';
    return 'text-error-600';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'credit-lookup', label: 'Credit Lookup', icon: <Hash className="h-4 w-4" /> },
    { id: 'applications', label: 'Applications', icon: <FileText className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <PieChart className="h-4 w-4" /> },
    { id: 'reports', label: 'Reports', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  const filteredApplications = recentApplications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.bank} Dashboard</h1>
          <p className="text-gray-600">Secure credit assessment and loan management platform</p>

          {/* Verification Status */}
          <div className="mt-4">
            {isVerified ? (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verified Bank Representative
              </div>
            ) : (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-error-100 text-error-800">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Verification Required
              </div>
            )}
          </div>
        </div>

        {/* Verification Required Message */}
        {!isVerified && (
          <Card className="mb-8 border-error-200 bg-error-50">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-error-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-error-900 mb-2">Bank Verification Required</h3>
                <p className="text-error-800 mb-4">
                  You need to be verified as a bank representative to access client data and loan
                  applications. Please contact your bank administrator to obtain the verification code
                  and re-login.
                </p>
                <div className="bg-error-100 border border-error-200 rounded-lg p-3">
                  <p className="text-sm text-error-700 font-medium mb-2">Verification codes are provided by your bank and follow this format:</p>
                  <p className="text-xs text-error-600 font-mono">
                    {user?.bank?.toUpperCase().replace(/\s+/g, '').slice(0, 4)}-VERIFY-2024
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="bg-primary-100 rounded-lg p-3">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center">
              <div className="bg-success-100 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved Loans</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approvedLoans}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center">
              <div className="bg-warning-100 rounded-lg p-3">
                <AlertTriangle className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingReview}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center">
              <div className="bg-primary-100 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Amount (ZWL)</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center px-3 py-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Overview</h2>
            <p>Welcome to your bank dashboard! Here you can track applications, view analytics, and manage credit lookups.</p>
          </div>
        )}

        {activeTab === 'credit-lookup' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Credit Lookup</h2>
            <div className="flex space-x-3 mb-4 max-w-md">
              <Input
                placeholder="Enter Account Number"
                value={accountLookup}
                onChange={(e) => setAccountLookup(e.target.value)}
                disabled={!isVerified}
              />
              <Button onClick={handleAccountLookup} disabled={!isVerified}>
                Lookup
              </Button>
            </div>
            {lookupError && (
              <p className="text-error-600 mb-4">{lookupError}</p>
            )}
            {lookupResult && (
              <Card className="p-4 border-primary-200 bg-primary-50 max-w-md">
                <h3 className="font-semibold text-lg mb-2">Client Details</h3>
                <p><strong>Name:</strong> {lookupResult.name}</p>
                <p><strong>Account Number:</strong> {lookupResult.accountNumber}</p>
                <p><strong>Loan Amount:</strong> ZWL {lookupResult.amount.toLocaleString()}</p>
                <p><strong>Credit Score:</strong> {lookupResult.creditScore}</p>
                <p><strong>Status:</strong> {lookupResult.status}</p>
                <p><strong>Risk Level:</strong> {lookupResult.riskLevel}</p>
                <p><strong>Purpose:</strong> {lookupResult.purpose}</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
            <div className="mb-4 max-w-md">
              <Input
                placeholder="Search by name, purpose, or account number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!isVerified}
              />
            </div>
            {filteredApplications.length === 0 ? (
              <p>No applications found.</p>
            ) : (
              <div className="overflow-x-auto max-w-full">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Applicant</th>
                      <th className="px-4 py-2 text-left font-medium">Amount (ZWL)</th>
                      <th className="px-4 py-2 text-left font-medium">Credit Score</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                      <th className="px-4 py-2 text-left font-medium">Risk Level</th>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.map((app) => (
                      <tr key={app.id}>
                        <td className="px-4 py-2">{app.name}</td>
                        <td className="px-4 py-2">ZWL {app.amount.toLocaleString()}</td>
                        <td className={`px-4 py-2 font-semibold ${getCreditScoreColor(app.creditScore)}`}>{app.creditScore}</td>
                        <td className={`px-4 py-2 font-semibold ${getStatusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </td>
                        <td className="px-4 py-2">{app.riskLevel.charAt(0).toUpperCase() + app.riskLevel.slice(1)}</td>
                        <td className="px-4 py-2">{new Date(app.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{app.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Credit Score Distribution</h2>
            <div className="max-w-md space-y-3">
              {creditDistribution.map(({ range, count, percentage }) => (
                <div key={range}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{range}</span>
                    <span>{count} clients ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-3">
                    <div
                      className="bg-primary-600 h-3 rounded"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Reports</h2>
            <p>Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
