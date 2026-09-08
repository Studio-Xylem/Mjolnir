import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div 
      className="loading-state"
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        color: 'var(--text-secondary, #6B5B4E)',
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-color, #E8E0D8);
            border-top-color: var(--text-primary, #2C1810);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
        `}
      </style>
      <div className="spinner" aria-hidden="true" />
      <p style={{ margin: 0, fontWeight: 500 }}>{message}</p>
    </div>
  );
}
