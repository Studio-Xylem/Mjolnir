import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ padding: '64px 16px', textAlign: 'center' }}>
      <Search size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }} />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '8px', color: 'var(--color-text-main)' }}>Page not found</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>The page you're looking for doesn't exist.</p>
      <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 500 }}>
        Return to Home
      </Link>
    </div>
  );
};
