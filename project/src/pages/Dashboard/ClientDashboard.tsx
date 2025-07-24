import React, { useState } from 'react';
import { CreditCard, TrendingUp, CheckCircle, FileText, Calculator, Target, Award, Hash, Plus, Send } from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useLoanApplications } from '../../hooks/useLoanApplications';
import { useBanks } from '../../hooks/useBanks';

export function ClientDashboard() {
  const { user } = useAuth();
  const { applications, createApplication, isLoading: applicationsLoading } = useLoanApplications();
  const { banks, isLoading: banksLoading } = useBanks();
  const [activeTab, setActiveTab] = useState('overview');
  const [loanCalculator, setLoanCalculator] = useState({
    amount: '',
    rate: '',
    term: '',
    monthlyPayment: 0,
    totalInterest: 0,
    totalAmount: 0
  });

  const [loanApplication, setLoanApplication] = useState({
    amount: '',
    purpose: '',
    bank: '',
    term: '',
    income: '',
    employment: '',
    collateral: '',
    description: ''
  });

  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Use user's actual credit score if available, otherwise use mock data
  const creditScore = user?.creditScore || 785;
  const scoreChange = 12;

  const creditFactors = [
    { name: 'Payment History', score: 95, color: 'success' },
    { name: 'Credit Utilization', score: 75, color: 'warning' },
    { name: 'Length of Credit History', score: 85, color: 'primary' },
    { name: 'Types of Credit', score: 70, color: 'warning' },
    { name: 'New Credit', score: 80, color: 'primary' }
  ];

  const recommendations = [
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: 'Reduce Credit Utilization',
      description: 'Keep your credit utilization below 30% to improve your score',
      priority: 'high'
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: 'Continue On-time Payments',
      description: 'Your payment history is excellent. Keep it up!',
      priority: 'low'
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: 'Diversify Credit Types',
      description: 'Consider adding different types of credit accounts',
      priority: 'medium'
    }
  ];

  const loanPurposes = [
    'Home Purchase',
    'Vehicle Purchase',
    'Business Expansion',
    'Debt Consolidation',
    'Education',
    'Medical Expenses',
    'Home Improvement',
    'Personal Use',
    'Other'
  ];

  const calculateLoan = () => {
    const principal = parseFloat(loanCalculator.amount);
    const annualRate = parseFloat(loanCalculator.rate) / 100;
    const months = parseInt(loanCalculator.term);

    if (!principal || !annualRate || !months || principal <= 0 || annualRate <= 0 || months <= 0) {
      alert('Please fill in all fields with valid positive numbers');
      return;
    }

    const monthlyRate = annualRate / 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1);
    
    const totalAmount = monthlyPayment * months;
    const totalInterest = totalAmount - principal;

    setLoanCalculator(prev => ({
      ...prev,
      monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
      totalInterest: isNaN(totalInterest) ? 0 : totalInterest,
      totalAmount: isNaN(totalAmount) ? 0 : totalAmount
    }));
  };

  const handleCalculatorChange = (field: string, value: string) => {
    setLoanCalculator(prev => ({
      ...prev,
      [field]: value,
      // Reset calculations when inputs change
      monthlyPayment: field === 'amount' || field === 'rate' || field === 'term' ? 0 : prev.monthlyPayment,
      totalInterest: field === 'amount' || field === 'rate' || field === 'term' ? 0 : prev.totalInterest,
      totalAmount: field === 'amount' || field === 'rate' || field === 'term' ? 0 : prev.totalAmount
    }));
  };

  const handleApplicationChange = (field: string, value: string) => {
    setLoanApplication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitApplication = async () => {
    // Validation
    if (!loanApplication.amount || !loanApplication.purpose || !loanApplication.bank || !loanApplication.term || 
        !loanApplication.income || !loanApplication.employment) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(loanApplication.amount) <= 0) {
      alert('Please enter a valid loan amount');
      return;
    }

    if (parseInt(loanApplication.term) <= 0) {
      alert('Please enter a valid loan term');
      return;
    }

    if (parseFloat(loanApplication.income) <= 0) {
      alert('Please enter a valid monthly income');
      return;
    }

    const selectedBank = banks.find(b => b.name === loanApplication.bank);
    if (!selectedBank) {
      alert('Please select a valid bank');
      return;
    }

    setApplicationSubmitted(true);
    
    try {
      await createApplication({
        bank_id: selectedBank.id,
        amount: parseFloat(loanApplication.amount),
        purpose: loanApplication.purpose,
        term_months: parseInt(loanApplication.term),
        monthly_income: parseFloat(loanApplication.income),
        employment_status: loanApplication.employment,
        collateral: loanApplication.collateral || null,
        description: loanApplication.description || null,
      });
      
      setApplicationSubmitted(false);
      setShowApplicationForm(false);
      setLoanApplication({
        amount: '',
        purpose: '',
        bank: '',
        term: '',
        income: '',
        employment: '',
        collateral: '',
        description: ''
      });
      alert('Loan application submitted successfully! You will receive a response within 24-48 hours.');
    } catch (error) {
      setApplicationSubmitted(false);
      alert('Failed to submit application. Please try again.');
      console.error('Application submission error:', error);
    }
  };

  const handleViewDetails = (applicationId: number) => {
    alert(`Viewing details for application #${applicationId}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-success-500';
    if (score >= 650) return 'text-warning-500';
    return 'text-error-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 750) return 'Excellent';
    if (score >= 650) return 'Good';
    return 'Fair';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success-100 text-success-800';
      case 'pending': return 'bg-warning-100 text-warning-800';
      case 'rejected': return 'bg-error-100 text-error-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'applications', label: 'Loan Applications', icon: <FileText className="h-4 w-4" /> },
    { id: 'calculator', label: 'Loan Calculator', icon: <Calculator className="h-4 w-4" /> },
    { id: 'improvement', label: 'Score Improvement', icon: <Award className="h-4 w-4" /> }
  ];

  if (applicationsLoading || banksLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Secure Credit Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor your credit score and manage your loan applications securely
          </p>
          {user?.accountNumber && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Hash className="h-4 w-4 mr-1" />
              Account: {user.accountNumber}
            </div>
          )}
        </div>

        {/* Credit Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Credit Score</h2>
              <div className="relative">
                <div className="w-48 h-48 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#007bff"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(creditScore / 850) * 251.2} 251.2`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(creditScore)}`}>
                        {creditScore}
                      </div>
                      <div className="text-sm text-gray-500">out of 850</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className={`text-lg font-semibold ${getScoreColor(creditScore)}`}>
                  {getScoreLabel(creditScore)}
                </div>
                <div className="flex items-center justify-center mt-2">
                  <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                  <span className="text-sm text-success-600">
                    +{scoreChange} points this month
                  </span>
                </div>
              </div>
              
              {/* Security Badge */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm text-blue-700 font-medium">
                    Secured with Account Verification
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <div className="flex items-center">
                <div className="bg-primary-100 rounded-lg p-3">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
                  <div className="text-sm text-gray-500">Active Applications</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="bg-success-100 rounded-lg p-3">
                  <CheckCircle className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {user?.riskLevel === 'low' ? '95%' : user?.riskLevel === 'medium' ? '75%' : '45%'}
                  </div>
                  <div className="text-sm text-gray-500">Approval Rate</div>
                </div>
              </div>
            </Card>

            {user?.riskLevel && (
              <Card>
                <div className="flex items-center">
                  <div className={`rounded-lg p-3 ${
                    user.riskLevel === 'low' ? 'bg-success-100' :
                    user.riskLevel === 'medium' ? 'bg-warning-100' : 'bg-error-100'
                  }`}>
                    <Target className={`h-6 w-6 ${
                      user.riskLevel === 'low' ? 'text-success-600' :
                      user.riskLevel === 'medium' ? 'text-warning-600' : 'text-error-600'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <div className={`text-2xl font-bold capitalize ${
                      user.riskLevel === 'low' ? 'text-success-600' :
                      user.riskLevel === 'medium' ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {user.riskLevel}
                    </div>
                    <div className="text-sm text-gray-500">Risk Level</div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Credit Factors */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Credit Score Factors
              </h3>
              <div className="space-y-4">
                {creditFactors.map((factor, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {factor.name}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {factor.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          factor.color === 'success' ? 'bg-success-500' :
                          factor.color === 'warning' ? 'bg-warning-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Improvement Recommendations
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      rec.priority === 'high' ? 'bg-error-100 text-error-600' :
                      rec.priority === 'medium' ? 'bg-warning-100 text-warning-600' :
                      'bg-success-100 text-success-600'
                    }`}>
                      {rec.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Apply for Loan Button */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Apply for a New Loan</h3>
                  <p className="text-gray-600">Submit a new loan application with your current credit profile</p>
                </div>
                <Button 
                  onClick={() => setShowApplicationForm(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Apply Now</span>
                </Button>
              </div>
            </Card>

            {/* Loan Application Form */}
            {showApplicationForm && (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">New Loan Application</h3>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowApplicationForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input
                      label="Loan Amount ($) *"
                      type="number"
                      value={loanApplication.amount}
                      onChange={(e) => handleApplicationChange('amount', e.target.value)}
                      placeholder="Enter loan amount"
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Bank *
                      </label>
                      <select
                        value={loanApplication.bank}
                        onChange={(e) => handleApplicationChange('bank', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="">Choose a bank...</option>
                        {banks.map(bank => (
                          <option key={bank.id} value={bank.name}>{bank.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Purpose *
                      </label>
                      <select
                        value={loanApplication.purpose}
                        onChange={(e) => handleApplicationChange('purpose', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select loan purpose...</option>
                        {loanPurposes.map(purpose => (
                          <option key={purpose} value={purpose}>{purpose}</option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Loan Term (months) *"
                      type="number"
                      value={loanApplication.term}
                      onChange={(e) => handleApplicationChange('term', e.target.value)}
                      placeholder="Enter loan term in months"
                      required
                    />

                    <Input
                      label="Monthly Income ($) *"
                      type="number"
                      value={loanApplication.income}
                      onChange={(e) => handleApplicationChange('income', e.target.value)}
                      placeholder="Enter your monthly income"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Employment Status *"
                      type="text"
                      value={loanApplication.employment}
                      onChange={(e) => handleApplicationChange('employment', e.target.value)}
                      placeholder="e.g., Full-time, Self-employed, etc."
                      required
                    />

                    <Input
                      label="Collateral (Optional)"
                      type="text"
                      value={loanApplication.collateral}
                      onChange={(e) => handleApplicationChange('collateral', e.target.value)}
                      placeholder="Describe any collateral"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Information
                      </label>
                      <textarea
                        value={loanApplication.description}
                        onChange={(e) => handleApplicationChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Provide any additional information about your loan request..."
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Your Credit Profile</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Credit Score:</span>
                        <span className={`ml-2 font-bold ${getScoreColor(creditScore)}`}>
                          {creditScore}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">Risk Level:</span>
                        <span className={`ml-2 font-bold capitalize ${
                          user?.riskLevel === 'low' ? 'text-success-600' :
                          user?.riskLevel === 'medium' ? 'text-warning-600' : 'text-error-600'
                        }`}>
                          {user?.riskLevel || 'Low'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowApplicationForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmitApplication}
                      disabled={applicationSubmitted}
                      className="flex items-center space-x-2"
                    >
                      {applicationSubmitted ? (
                        <>
                          <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Existing Applications */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Loan Applications
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {app.bank_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${app.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.purpose}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(app.id)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No loan applications found. Click "Apply Now" to submit your first application.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'calculator' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Loan Calculator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Loan Amount ($)"
                  type="number"
                  value={loanCalculator.amount}
                  onChange={(e) => handleCalculatorChange('amount', e.target.value)}
                  placeholder="Enter loan amount"
                />
                <Input
                  label="Annual Interest Rate (%)"
                  type="number"
                  step="0.1"
                  value={loanCalculator.rate}
                  onChange={(e) => handleCalculatorChange('rate', e.target.value)}
                  placeholder="Enter interest rate"
                />
                <Input
                  label="Loan Term (months)"
                  type="number"
                  value={loanCalculator.term}
                  onChange={(e) => handleCalculatorChange('term', e.target.value)}
                  placeholder="Enter loan term"
                />
                <Button className="w-full" onClick={calculateLoan}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Payment
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Calculation Results
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Payment:</span>
                    <span className="font-semibold">
                      ${loanCalculator.monthlyPayment.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Interest:</span>
                    <span className="font-semibold">
                      ${loanCalculator.totalInterest.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold">
                      ${loanCalculator.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                {loanCalculator.monthlyPayment > 0 && (
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                    <p className="text-sm text-primary-700">
                      <strong>Tip:</strong> Consider making extra payments to reduce total interest!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'improvement' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Score Improvement Plan
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <h4 className="font-semibold text-primary-900 mb-2">
                    Short-term Goals (1-3 months)
                  </h4>
                  <ul className="text-sm text-primary-800 space-y-1">
                    <li>• Pay down credit card balances below 30% utilization</li>
                    <li>• Set up automatic payments for all bills</li>
                    <li>• Monitor credit report for errors</li>
                  </ul>
                </div>
                <div className="p-4 bg-warning-50 rounded-lg border border-warning-200">
                  <h4 className="font-semibold text-warning-900 mb-2">
                    Medium-term Goals (3-6 months)
                  </h4>
                  <ul className="text-sm text-warning-800 space-y-1">
                    <li>• Keep old accounts open to maintain credit history</li>
                    <li>• Consider a secured credit card if needed</li>
                    <li>• Limit new credit applications</li>
                  </ul>
                </div>
                <div className="p-4 bg-success-50 rounded-lg border border-success-200">
                  <h4 className="font-semibold text-success-900 mb-2">
                    Long-term Goals (6+ months)
                  </h4>
                  <ul className="text-sm text-success-800 space-y-1">
                    <li>• Maintain diverse credit mix</li>
                    <li>• Keep utilization below 10% for optimal score</li>
                    <li>• Build long-term payment history</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Credit Score Simulator
              </h3>
              <p className="text-gray-600 mb-4">
                See how different actions might affect your credit score
              </p>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Pay off $5,000 credit card debt</span>
                    <span className="text-success-600 font-semibold">+25 points</span>
                  </div>
                  <div className="text-xs text-gray-500">Impact: High</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Open new credit card</span>
                    <span className="text-error-600 font-semibold">-10 points</span>
                  </div>
                  <div className="text-xs text-gray-500">Impact: Temporary</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Make all payments on time for 6 months</span>
                    <span className="text-success-600 font-semibold">+15 points</span>
                  </div>
                  <div className="text-xs text-gray-500">Impact: Medium</div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}