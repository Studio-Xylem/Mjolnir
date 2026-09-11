import React from 'react';
import { X } from 'lucide-react';
import { AuthCard } from './AuthCard';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode = 'signin'
}) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div 
        className="auth-modal-content" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true"
      >
        <button 
          className="auth-modal-close-btn" 
          onClick={onClose} 
          aria-label="Close authentication modal"
        >
          <X size={20} />
        </button>

        <AuthCard 
          initialMode={initialMode} 
          onSuccess={onClose} 
          showHeader={true}
        />
      </div>
    </div>
  );
};
