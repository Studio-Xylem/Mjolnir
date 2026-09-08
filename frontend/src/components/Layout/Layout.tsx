import React from 'react';
import { Header } from './Header';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Header />
      <main className="layout-main">
        {children}
      </main>
      <footer className="layout-footer">
        <p>&copy; {new Date().getFullYear()} Mjolnir Lost & Found</p>
      </footer>
    </div>
  );
}
