import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  BarChart3, 
  Zap, 
  Users, 
  TrendingUp, 
  Lock, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Target,
  Database,
  Brain
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Credit Scoring',
    description: 'Advanced machine learning algorithms analyze multiple data points to provide accurate credit scores tailored for the Zimbabwean market.',
    benefits: ['99.2% accuracy rate', 'Real-time processing', 'Continuous learning'],
    color: 'bg-blue-500'
  },
  {
    icon: Shield,
    title: 'Risk Assessment Engine',
    description: 'Comprehensive risk evaluation tools that help financial institutions make informed lending decisions with confidence.',
    benefits: ['Multi-factor analysis', 'Default prediction', 'Portfolio optimization'],
    color: 'bg-green-500'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics Dashboard',
    description: 'Interactive dashboards providing deep insights into credit trends, portfolio performance, and market analytics.',
    benefits: ['Real-time reporting', 'Custom visualizations', 'Export capabilities'],
    color: 'bg-purple-500'
  },
  {
    icon: Zap,
    title: 'Instant Credit Decisions',
    description: 'Lightning-fast credit scoring that enables immediate loan approvals and enhances customer experience.',
    benefits: ['Sub-second processing', 'Automated workflows', '24/7 availability'],
    color: 'bg-yellow-500'
  },
  {
    icon: Database,
    title: 'Comprehensive Data Integration',
    description: 'Seamlessly integrate with multiple data sources including banks, mobile money, and credit bureaus.',
    benefits: ['API connectivity', 'Data validation', 'Secure transmission'],
    color: 'bg-indigo-500'
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Bank-grade security measures ensuring complete data protection and regulatory compliance.',
    benefits: ['256-bit encryption', 'GDPR compliant', 'Audit trails'],
    color: 'bg-red-500'
  }
];

const stats = [
  { number: '50+', label: 'Financial Institutions', description: 'Trust our platform' },
  { number: '1M+', label: 'Credit Assessments', description: 'Processed monthly' },
  { number: '99.2%', label: 'Accuracy Rate', description: 'In credit predictions' },
  { number: '< 1s', label: 'Processing Time', description: 'Average response time' }
];

const useCases = [
  {
    icon: Users,
    title: 'For Banks & Financial Institutions',
    description: 'Streamline your lending process with accurate credit scoring and risk assessment tools.',
    features: ['Loan origination', 'Portfolio management', 'Regulatory reporting', 'Customer insights']
  },
  {
    icon: TrendingUp,
    title: 'For Microfinance Organizations',
    description: 'Expand financial inclusion with reliable credit scoring for underbanked populations.',
    features: ['Micro-loan assessment', 'Group lending', 'Mobile integration', 'Impact tracking']
  },
  {
    icon: Target,
    title: 'For Fintech Companies',
    description: 'Power your digital lending platform with our robust credit scoring API.',
    features: ['API integration', 'White-label solutions', 'Custom scoring models', 'Real-time decisions']
  }
];

export function Features() {
  const navigate = useNavigate();

  const handleStartFreeTrial = () => {
    navigate('/signup');
  };

  const handleScheduleDemo = () => {
    alert('Demo Scheduling: Please call +263 713 040 153 or email demo@creditscorepro.zw to schedule your demo.');
  };

  const handleGetStartedToday = () => {
    navigate('/signup');
  };

  const handleContactSales = () => {
    alert('Contact Sales: Please call +263 713 040 153 or email sales@creditscorepro.zw');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Powerful Features for
              <span className="block text-primary-200">Smart Credit Decisions</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover how our advanced credit scoring platform transforms lending decisions 
              with AI-powered insights and comprehensive risk assessment tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleStartFreeTrial}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button 
                onClick={handleScheduleDemo}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Features That Drive Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive suite of tools empowers financial institutions to make smarter, 
              faster, and more accurate lending decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center space-x-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Every Financial Institution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a traditional bank, microfinance organization, or fintech startup, 
              our platform adapts to your unique needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="bg-primary-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <useCase.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{useCase.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{useCase.description}</p>
                <ul className="space-y-3">
                  {useCase.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Seamless Integration & Implementation
              </h2>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                Get up and running in days, not months. Our platform integrates seamlessly 
                with your existing systems and workflows.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-primary-200" />
                  <span>Quick 48-hour setup</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-primary-200" />
                  <span>Bank-grade security</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-primary-200" />
                  <span>24/7 expert support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-6 w-6 text-primary-200" />
                  <span>Real-time processing</span>
                </div>
              </div>
            </div>
            <div className="animate-slide-in-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                <h3 className="text-xl font-bold mb-6">Integration Options</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                    <span>REST API</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                    <span>Webhook Support</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                    <span>SDK Libraries</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                    <span>White-label UI</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Lending Process?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join leading financial institutions across Zimbabwe who trust CreditScore Pro 
            for their credit assessment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStartedToday}
              className="bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Get Started Today</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              onClick={handleContactSales}
              className="border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-lg font-semibold hover:border-gray-500 hover:text-white transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}