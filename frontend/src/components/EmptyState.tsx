import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  message?: string;
  action?: { label: string; to: string } | React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, message, action }: EmptyStateProps) {
  const bodyText = description || message;
  const renderAction = () => {
    if (!action) return null;
    if (React.isValidElement(action)) return action;
    if (typeof action === 'object' && 'to' in action && 'label' in action) {
      return (
        <Link 
          to={action.to}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--text-primary, #2C1810)',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: 'var(--radius-md, 8px)',
            fontWeight: 600,
            transition: 'background-color 120ms ease'
          }}
        >
          {action.label}
        </Link>
      );
    }
    return null;
  };

  return (
    <div 
      className="empty-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1rem',
        textAlign: 'center',
        backgroundColor: 'var(--surface-paper, #ffffff)',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px dashed var(--border-color, #E8E0D8)',
        margin: '2rem 0'
      }}
    >
      {Icon && <Icon size={48} color="var(--text-muted, #9A8B7D)" style={{ marginBottom: '1rem' }} aria-hidden="true" />}
      <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'Fraunces, serif', color: 'var(--text-primary, #2C1810)', fontSize: '1.5rem' }}>
        {title}
      </h3>
      {bodyText && (
        <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary, #6B5B4E)', maxWidth: '400px' }}>
          {bodyText}
        </p>
      )}
      {renderAction()}
    </div>
  );
}
