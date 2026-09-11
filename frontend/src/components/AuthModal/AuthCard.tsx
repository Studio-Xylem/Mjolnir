import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  Sparkles,
  Code,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthCard.css';

interface AuthCardProps {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
  onModeChange?: (mode: 'signin' | 'signup') => void;
  showHeader?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({ 
  initialMode = 'signin', 
  onSuccess,
  onModeChange,
  showHeader = true
}) => {
  const { signIn, signUp, loginAsLocalUser, isLoading, error: contextError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dev bypass section
  const [showDevBypass, setShowDevBypass] = useState(false);
  const [devUsername, setDevUsername] = useState('Local Dev');

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setFormError(null);
    if (onModeChange) onModeChange(newMode);
  };

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = mode === 'signup' && confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (mode === 'signup') {
      if (!username.trim()) {
        setFormError('Please enter your name or username.');
        return;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match. Please verify.');
        return;
      }
    }

    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, username.trim());
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      let message = err.message || 'Authentication failed. Please try again.';
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/invalid-credential'
      ) {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      }
      setFormError(message);
    }
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sanitizedId = devUsername.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'test-user';
      await loginAsLocalUser(sanitizedId, devUsername || 'Local Dev');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to sign in with dev mode.');
    }
  };

  const displayError = formError || contextError;

  return (
    <div className="auth-card-container">
      {showHeader && (
        <header className="auth-card-header">
          <div className="auth-card-brand-badge">
            <Sparkles size={20} className="auth-brand-icon" />
          </div>
          <h2 className="auth-card-title">
            {mode === 'signin' ? 'Welcome back' : 'Join the community'}
          </h2>
          <p className="auth-card-subtitle">
            {mode === 'signin' 
              ? 'Sign in to report lost items and manage your listings' 
              : 'Create your account to reconnect people with their belongings'}
          </p>
        </header>
      )}

      {/* Segmented Pill Tabs */}
      <div className="auth-segmented-nav" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          className={`auth-segment-btn ${mode === 'signin' ? 'active' : ''}`}
          onClick={() => switchMode('signin')}
        >
          Sign In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={`auth-segment-btn ${mode === 'signup' ? 'active' : ''}`}
          onClick={() => switchMode('signup')}
        >
          Create Account
        </button>
      </div>

      {displayError && (
        <div className="auth-error-alert" role="alert">
          <AlertCircle size={18} className="auth-error-icon" />
          <span>{displayError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-card-form" noValidate>
        {mode === 'signup' && (
          <div className="auth-input-group">
            <label htmlFor="auth-name" className="auth-label">
              Full Name or Username
            </label>
            <div className="auth-field-wrapper">
              <UserIcon size={18} className="auth-field-icon" />
              <input
                id="auth-name"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Alex Morgan"
                required
                autoComplete="name"
                className="auth-input"
              />
            </div>
          </div>
        )}

        <div className="auth-input-group">
          <label htmlFor="auth-email-input" className="auth-label">
            Email Address
          </label>
          <div className="auth-field-wrapper">
            <Mail size={18} className="auth-field-icon" />
            <input
              id="auth-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="auth-input"
            />
          </div>
        </div>

        <div className="auth-input-group">
          <div className="auth-label-row">
            <label htmlFor="auth-password-input" className="auth-label">
              Password
            </label>
            {mode === 'signup' && (
              <span className="auth-helper-hint">Min 6 characters</span>
            )}
          </div>
          <div className="auth-field-wrapper">
            <Lock size={18} className="auth-field-icon" />
            <input
              id="auth-password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="auth-input with-trailing-btn"
            />
            <button
              type="button"
              className="auth-trailing-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {mode === 'signup' && (
          <div className="auth-input-group">
            <label htmlFor="auth-confirm-password" className="auth-label">
              Confirm Password
            </label>
            <div className="auth-field-wrapper">
              <Lock size={18} className="auth-field-icon" />
              <input
                id="auth-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                className={`auth-input with-trailing-btn ${passwordMismatch ? 'input-invalid' : ''}`}
              />
              <button
                type="button"
                className="auth-trailing-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordMismatch && (
              <p className="auth-field-msg error">Passwords do not match</p>
            )}
            {passwordsMatch && (
              <p className="auth-field-msg success">
                <CheckCircle2 size={12} /> Passwords match
              </p>
            )}
          </div>
        )}

        <button 
          type="submit" 
          className="auth-primary-btn" 
          disabled={isLoading || (mode === 'signup' && passwordMismatch)}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
            </>
          ) : (
            <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
          )}
        </button>
      </form>

      <footer className="auth-card-footer">
        {mode === 'signin' ? (
          <p className="auth-switch-text">
            Don't have an account?{' '}
            <button 
              type="button" 
              className="auth-switch-link" 
              onClick={() => switchMode('signup')}
            >
              Sign up
            </button>
          </p>
        ) : (
          <p className="auth-switch-text">
            Already have an account?{' '}
            <button 
              type="button" 
              className="auth-switch-link" 
              onClick={() => switchMode('signin')}
            >
              Sign in
            </button>
          </p>
        )}

        {/* Discreet Local Dev Drawer */}
        <div className="auth-dev-section">
          <button
            type="button"
            className="auth-dev-toggle"
            onClick={() => setShowDevBypass(!showDevBypass)}
          >
            <Code size={13} />
            <span>Developer bypass</span>
            {showDevBypass ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showDevBypass && (
            <div className="auth-dev-box">
              <p className="auth-dev-description">
                Quickly sign in as a local mock user without needing Firebase credentials.
              </p>
              <div className="auth-dev-row">
                <input
                  type="text"
                  value={devUsername}
                  onChange={(e) => setDevUsername(e.target.value)}
                  placeholder="Test User Name"
                  className="auth-dev-input"
                />
                <button
                  type="button"
                  onClick={handleDevLogin}
                  className="auth-dev-btn"
                  disabled={isLoading}
                >
                  Quick Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
