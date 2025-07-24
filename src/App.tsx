import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { LoadingSpinner } from './components/UI/LoadingSpinner';
import { Landing } from './pages/Landing';
import { Features } from './pages/Features';
import { About } from './pages/About';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';
import { ClientDashboard } from './pages/Dashboard/ClientDashboard';
import { BankDashboard } from './pages/Dashboard/BankDashboard';
import { AdminDashboard } from './pages/Admin/AdminDashboard';

function ProtectedRoute({ children, userType }: { children: React.ReactNode; userType?: 'client' | 'bank' }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (userType && user?.type !== userType) {
    return <Navigate to={user?.type === 'client' ? '/client-dashboard' : '/bank-dashboard'} replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated 
              ? <Navigate to={user?.type === 'client' ? '/client-dashboard' : '/bank-dashboard'} replace />
              : <Landing />
            } 
          />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route 
            path="/login" 
            element={isAuthenticated 
              ? <Navigate to={user?.type === 'client' ? '/client-dashboard' : '/bank-dashboard'} replace />
              : <Login />
            } 
          />
          <Route 
            path="/signup" 
            element={isAuthenticated 
              ? <Navigate to={user?.type === 'client' ? '/client-dashboard' : '/bank-dashboard'} replace />
              : <Signup />
            } 
          />
          <Route 
            path="/client-dashboard" 
            element={
              <ProtectedRoute userType="client">
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bank-dashboard" 
            element={
              <ProtectedRoute userType="bank">
                <BankDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={<AdminDashboard />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAuthenticated && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;