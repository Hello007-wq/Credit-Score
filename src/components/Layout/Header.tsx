import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActivePage = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getLinkClasses = (path: string, baseClasses: string) => {
    const isActive = isActivePage(path);
    return `${baseClasses} ${
      isActive 
        ? 'text-primary-600 bg-primary-50 px-3 py-2 rounded-lg font-medium' 
        : 'text-gray-600 hover:text-primary-500'
    } transition-all duration-200`;
  };

  const getMobileLinkClasses = (path: string, baseClasses: string) => {
    const isActive = isActivePage(path);
    return `${baseClasses} ${
      isActive 
        ? 'text-primary-600 bg-primary-50 px-3 py-2 rounded-lg font-medium' 
        : 'text-gray-600 hover:text-primary-500'
    } transition-all duration-200`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary-500 p-2 rounded-lg group-hover:bg-primary-600 transition-colors">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CreditScore Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/" 
                  className={getLinkClasses('/', '')}
                >
                  Home
                </Link>
                <Link 
                  to="/features" 
                  className={getLinkClasses('/features', '')}
                >
                  Features
                </Link>
                <Link 
                  to="/about" 
                  className={getLinkClasses('/about', '')}
                >
                  About
                </Link>
                <Link 
                  to="/login" 
                  className="text-primary-500 hover:text-primary-600 font-medium transition-colors px-3 py-2"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to={user?.type === 'client' ? '/client-dashboard' : '/bank-dashboard'} 
                  className={getLinkClasses(
                    user?.type === 'client' ? '/client-dashboard' : '/bank-dashboard', 
                    ''
                  )}
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <div className="text-gray-900 font-medium">{user?.name}</div>
                    <div className="text-gray-500 capitalize">{user?.type}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-2">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/" 
                    className={getMobileLinkClasses('/', 'block')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/features" 
                    className={getMobileLinkClasses('/features', 'block')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link 
                    to="/about" 
                    className={getMobileLinkClasses('/about', 'block')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/login" 
                    className="text-primary-500 hover:text-primary-600 font-medium transition-colors block px-3 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to={user?.type === 'client' ? '/client-dashboard' : '/bank-dashboard'} 
                    className={getMobileLinkClasses(
                      user?.type === 'client' ? '/client-dashboard' : '/bank-dashboard', 
                      'block'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">{user?.name}</div>
                      <div className="text-gray-500 capitalize">{user?.type}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}