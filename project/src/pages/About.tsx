import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Award, 
  Globe, 
  TrendingUp, 
  Shield, 
  Heart,
  ArrowRight,
  CheckCircle,
  MapPin,
  Calendar,
  Briefcase
} from 'lucide-react';

const team = [
  {
    name: 'Joel Mukamuri',
    role: 'Chief Executive Officer',
    image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Former banking executive with 15+ years in financial services across Africa.',
    linkedin: '#'
  },
  {
    name: 'David Chikwanha',
    role: 'Chief Technology Officer',
    image: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'AI/ML expert with experience building fintech solutions for emerging markets.',
    linkedin: '#'
  },
  {
    name: 'Vincent Mutindi',
    role: 'Head of Risk Analytics',
    image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Risk management specialist with deep expertise in African credit markets.',
    linkedin: '#'
  },
  {
    name: 'Michael Nyoni',
    role: 'Head of Business Development',
    image: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Strategic partnerships leader focused on financial inclusion initiatives.',
    linkedin: '#'
  }
];

const values = [
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'We prioritize data security and maintain the highest standards of confidentiality and compliance.'
  },
  {
    icon: Heart,
    title: 'Financial Inclusion',
    description: 'We believe everyone deserves access to fair and transparent financial services.'
  },
  {
    icon: TrendingUp,
    title: 'Innovation',
    description: 'We continuously innovate to provide cutting-edge solutions for the evolving financial landscape.'
  },
  {
    icon: Users,
    title: 'Partnership',
    description: 'We build lasting relationships with our clients, supporting their growth and success.'
  }
];

const milestones = [
  {
    year: '2020',
    title: 'Company Founded',
    description: 'CreditScore Pro was established with a vision to democratize credit access in Zimbabwe.'
  },
  {
    year: '2021',
    title: 'First AI Model Deployed',
    description: 'Launched our first machine learning model specifically trained on Zimbabwean credit data.'
  },
  {
    year: '2022',
    title: 'Major Bank Partnership',
    description: 'Secured partnerships with 3 major commercial banks, processing over 100K assessments monthly.'
  },
  {
    year: '2023',
    title: 'Microfinance Expansion',
    description: 'Extended services to microfinance institutions, reaching underbanked populations.'
  },
  {
    year: '2024',
    title: 'Regional Growth',
    description: 'Expanded operations across Southern Africa with offices in Botswana and Zambia.'
  },
  {
    year: '2025',
    title: 'AI Innovation Hub',
    description: 'Established our AI research center focused on financial inclusion technologies.'
  }
];

const stats = [
  { number: '50+', label: 'Partner Institutions' },
  { number: '1M+', label: 'Credit Assessments' },
  { number: '5', label: 'Countries Served' },
  { number: '99.2%', label: 'Accuracy Rate' }
];

export function About() {
  const navigate = useNavigate();

  const handleScheduleDemo = () => {
    alert('Demo Scheduling: Please call +263 713 040 153 or email demo@creditscorepro.zw to schedule your demo.');
  };

  const handleContactTeam = () => {
    alert('Contact Information:\nPhone: +263 713 040 153\nEmail: info@creditscorepro.zw\nAddress: Harare, Zimbabwe');
  };

  const handleJoinMission = () => {
    navigate('/signup');
  };

  const handleOurStory = () => {
    // Scroll to timeline section
    const timelineSection = document.getElementById('timeline-section');
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Empowering Financial
                <span className="block text-primary-200">Inclusion in Africa</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-8 leading-relaxed">
                We're on a mission to democratize access to credit by providing financial institutions 
                with the most accurate and inclusive credit scoring technology in Africa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleJoinMission}
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Join Our Mission</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleOurStory}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Our Story
                </button>
              </div>
            </div>
            <div className="animate-slide-in-right">
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Team collaboration" 
                  className="rounded-xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent rounded-xl"></div>
              </div>
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
                <div className="text-lg font-semibold text-gray-900">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="animate-slide-up">
              <div className="bg-primary-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To democratize access to credit across Africa by providing financial institutions 
                with the most accurate, inclusive, and innovative credit scoring technology available.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe that everyone deserves access to fair financial services, regardless of 
                their background or current financial status. Our AI-powered platform helps lenders 
                make informed decisions while expanding access to credit for underserved populations.
              </p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To become Africa's leading credit intelligence platform, enabling financial inclusion 
                and economic growth across the continent.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We envision a future where credit decisions are made fairly, quickly, and accurately, 
                where small businesses can access the capital they need to grow, and where individuals 
                can build their financial futures with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape how we build relationships 
              with our clients, partners, and communities.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-primary-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a small startup to Africa's leading credit intelligence platform, 
              here's how we've grown and evolved.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} animate-slide-up`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                      <div className="text-primary-600 font-bold text-lg mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-primary-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our diverse team brings together expertise in finance, technology, and African markets 
              to drive innovation in credit scoring.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div 
                key={index} 
                className="text-center group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative mb-6">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg group-hover:shadow-xl transition-shadow"
                  />
                  <div className="absolute inset-0 bg-primary-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <div className="text-primary-600 font-semibold mb-3">{member.role}</div>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Proudly Based in Zimbabwe
              </h2>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                From our headquarters in Harare, we serve financial institutions across Africa, 
                bringing local expertise and global technology together.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-6 w-6 text-primary-200" />
                  <span>Harare, Zimbabwe</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-6 w-6 text-primary-200" />
                  <span>50+ Team Members</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-6 w-6 text-primary-200" />
                  <span>5 Countries Served</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-primary-200" />
                  <span>Founded in 2020</span>
                </div>
              </div>
            </div>
            <div className="animate-slide-in-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                <h3 className="text-xl font-bold mb-6">Ready to Get Started?</h3>
                <p className="text-primary-100 mb-6">
                  Join the growing number of financial institutions transforming their 
                  lending processes with CreditScore Pro.
                </p>
                <div className="space-y-4">
                  <button 
                    onClick={handleScheduleDemo}
                    className="w-full bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Schedule a Demo</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleContactTeam}
                    className="w-full border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    Contact Our Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}