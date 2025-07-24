import React, { useState } from 'react';
import { Shield, Key, Users, Database, Settings, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useAuth } from '../../contexts/AuthContext';

export function AdminDashboard() {
  const { getBankList, getVerificationCode, isValidVerificationCode } = useAuth();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newCode, setNewCode] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [testCode, setTestCode] = useState('');
  const [testBank, setTestBank] = useState('');
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);

  const bankList = getBankList();

  const handleCopyCode = async (code: string, bankName: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(`${bankName}-${code}`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleGenerateNewCode = () => {
    if (!selectedBank) {
      alert('Please select a bank first');
      return;
    }
    
    const timestamp = new Date().getFullYear();
    const bankCode = bankList.find(b => b.name === selectedBank)?.code || 'BANK';
    const generatedCode = `${bankCode}-VERIFY-${timestamp}`;
    setNewCode(generatedCode);
  };

  const handleTestCode = () => {
    if (!testBank || !testCode) {
      setTestResult({ valid: false, message: 'Please enter both bank and verification code' });
      return;
    }

    const isValid = isValidVerificationCode(testBank, testCode);
    setTestResult({
      valid: isValid,
      message: isValid 
        ? 'Verification code is valid and active' 
        : 'Invalid verification code. Please check the code and try again.'
    });
  };

  const handleResetTestResult = () => {
    setTestResult(null);
    setTestCode('');
    setTestBank('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Administrator Dashboard
          </h1>
          <p className="text-gray-600">
            Manage bank verification codes and system settings
          </p>
        </div>

        {/* Admin Warning */}
        <Card className="mb-8 border-warning-200 bg-warning-50">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-warning-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-warning-900 mb-2">
                Administrator Access
              </h3>
              <p className="text-warning-800 mb-4">
                This dashboard provides access to sensitive system functions. Only authorized personnel should access these features.
                All actions are logged for security purposes.
              </p>
              <div className="bg-warning-100 border border-warning-200 rounded-lg p-3">
                <p className="text-sm text-warning-700 font-medium">
                  Security Notice: Verification codes should be distributed securely to authorized bank representatives only.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="bg-primary-100 rounded-lg p-3">
                <Database className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{bankList.length}</div>
                <div className="text-sm text-gray-500">Registered Banks</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="bg-success-100 rounded-lg p-3">
                <Key className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{bankList.length}</div>
                <div className="text-sm text-gray-500">Active Codes</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="bg-warning-100 rounded-lg p-3">
                <Users className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">24</div>
                <div className="text-sm text-gray-500">Verified Reps</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="bg-error-100 rounded-lg p-3">
                <Shield className="h-6 w-6 text-error-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-500">System Uptime</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bank Verification Codes */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Bank Verification Codes
            </h3>
            
            <div className="space-y-4">
              {bankList.map((bank) => (
                <div key={bank.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{bank.name}</div>
                    <div className="text-sm text-gray-500">Code: {bank.code}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                      {bank.verificationCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCode(bank.verificationCode, bank.name)}
                      className="flex items-center space-x-1"
                    >
                      {copiedCode === `${bank.name}-${bank.verificationCode}` ? (
                        <Check className="h-4 w-4 text-success-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Distribution Instructions</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Share codes only with authorized bank representatives</li>
                <li>• Codes should be transmitted through secure channels</li>
                <li>• Representatives must use these codes during registration</li>
                <li>• Monitor usage and regenerate codes if compromised</li>
              </ul>
            </div>
          </Card>

          {/* Code Management Tools */}
          <div className="space-y-6">
            {/* Generate New Code */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RefreshCw className="h-5 w-5 mr-2" />
                Generate New Code
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Choose a bank...</option>
                    {bankList.map(bank => (
                      <option key={bank.id} value={bank.name}>{bank.name}</option>
                    ))}
                  </select>
                </div>

                <Button 
                  onClick={handleGenerateNewCode}
                  className="w-full"
                  disabled={!selectedBank}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate New Code
                </Button>

                {newCode && (
                  <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                    <p className="text-sm text-success-700 mb-2">New verification code generated:</p>
                    <div className="flex items-center justify-between">
                      <code className="bg-success-100 px-2 py-1 rounded text-sm font-mono">
                        {newCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(newCode, selectedBank)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Test Verification Code */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Test Verification Code
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank
                  </label>
                  <select
                    value={testBank}
                    onChange={(e) => setTestBank(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Choose a bank...</option>
                    {bankList.map(bank => (
                      <option key={bank.id} value={bank.name}>{bank.name}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Verification Code"
                  type="text"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  placeholder="Enter verification code to test"
                />

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleTestCode}
                    className="flex-1"
                    disabled={!testBank || !testCode}
                  >
                    Test Code
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleResetTestResult}
                  >
                    Reset
                  </Button>
                </div>

                {testResult && (
                  <div className={`p-3 border rounded-lg ${
                    testResult.valid 
                      ? 'bg-success-50 border-success-200' 
                      : 'bg-error-50 border-error-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {testResult.valid ? (
                        <Check className="h-5 w-5 text-success-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-error-600" />
                      )}
                      <p className={`text-sm font-medium ${
                        testResult.valid ? 'text-success-700' : 'text-error-700'
                      }`}>
                        {testResult.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* System Information */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Information
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Database Status:</span>
                  <span className="text-success-600 font-medium">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Backup:</span>
                  <span className="text-gray-900">2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Sessions:</span>
                  <span className="text-gray-900">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">System Version:</span>
                  <span className="text-gray-900">v2.1.0</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Security Guidelines */}
        <Card className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Security Guidelines for Bank Verification Codes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Code Distribution</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Only share codes with verified bank representatives</li>
                <li>• Use secure communication channels (encrypted email, secure messaging)</li>
                <li>• Require identity verification before code distribution</li>
                <li>• Maintain a log of code distribution activities</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Code Management</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Regenerate codes periodically (recommended: quarterly)</li>
                <li>• Immediately regenerate if a code is compromised</li>
                <li>• Monitor failed verification attempts</li>
                <li>• Deactivate codes for inactive bank partnerships</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}