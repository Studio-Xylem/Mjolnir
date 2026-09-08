import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchInput.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="search-input-wrapper">
      <label htmlFor="search-input" className="sr-only">Search</label>
      <Search className="search-icon" size={18} aria-hidden="true" />
      <input
        id="search-input"
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search posts"
      />
      {value && (
        <button
          className="search-clear-btn"
          onClick={() => onChange('')}
          aria-label="Clear search"
          type="button"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
