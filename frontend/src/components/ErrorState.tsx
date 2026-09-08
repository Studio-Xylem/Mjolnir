import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div 
      className="error-state"
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        color: '#C23B22',
        textAlign: 'center',
        backgroundColor: '#FFF0F0',
        borderRadius: 'var(--radius-md, 8px)',
        border: '1px solid #FFD6D6',
        margin: '1rem 0'
      }}
    >
      <AlertCircle size={48} aria-hidden="true" style={{ marginBottom: '1rem' }} />
      <p style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid #C23B22',
            color: '#C23B22',
            borderRadius: 'var(--radius-sm, 4px)',
            cursor: 'pointer',
            fontWeight: 600,
            fontFamily: 'inherit'
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
