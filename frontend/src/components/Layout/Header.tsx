import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search, PlusCircle, User, Menu, X } from 'lucide-react';
import './Header.css';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
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
          <NavLink to="/my-posts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <User size={18} /> My Posts
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
