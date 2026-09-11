import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search, PlusCircle, User, Menu, X, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../AuthModal/AuthModal';
import './Header.css';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <>
      <header className="header" aria-label="Main navigation">
        <div className="header-container">
          <Link to="/" className="header-logo">Mjolnir</Link>
          
          <button 
            className="header-menu-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Search size={18} /> Browse
            </NavLink>

            <NavLink to="/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <PlusCircle size={18} /> Create Post
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/my-posts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <User size={18} /> My Posts
              </NavLink>
            )}

            <div className="header-auth-section">
              {isAuthenticated ? (
                <div className="user-profile-badge">
                  <span className="user-avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                  <span className="user-name">{user?.username || 'User'}</span>
                  <button className="btn-signout" onClick={signOut} title="Sign Out">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button className="btn-signin" onClick={() => setIsAuthModalOpen(true)}>
                  <LogIn size={16} /> Sign In
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
