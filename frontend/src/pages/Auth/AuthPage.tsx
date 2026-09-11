import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthCard } from '../../components/AuthModal/AuthCard';
import './AuthPage.css';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'signin' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const handleModeChange = (mode: 'signin' | 'signup') => {
    const targetPath = mode === 'signin' ? '/login' : '/register';
    if (location.pathname !== targetPath) {
      navigate(targetPath, { replace: true, state: location.state });
    }
  };

  const handleSuccess = () => {
    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-page-top-nav">
        <Link to="/" className="auth-page-back-link">
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </Link>
        <Link to="/" className="auth-page-brand">
          <Compass size={18} className="auth-brand-compass" />
          <span>Mjolnir</span>
        </Link>
      </div>

      <main className="auth-page-main">
        <div className="auth-page-card-wrapper">
          <AuthCard 
            initialMode={initialMode}
            onSuccess={handleSuccess}
            onModeChange={handleModeChange}
            showHeader={true}
          />
        </div>
      </main>

      <footer className="auth-page-footer">
        <p>Mjolnir Community Lost &amp; Found &bull; Safe, respectful, community-powered</p>
      </footer>
    </div>
  );
};
