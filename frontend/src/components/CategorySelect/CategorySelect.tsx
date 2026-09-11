import React, { useState, useRef, useEffect } from 'react';
import { Tag, Check, ChevronDown } from 'lucide-react';
import './CategorySelect.css';

export const PRESET_CATEGORIES = [
  'Electronics',
  'Phones & Accessories',
  'Laptops & Computers',
  'Headphones & Earbuds',
  'Wallets & Purses',
  'Keys & Keychains',
  'Bags & Backpacks',
  'IDs & Cards',
  'Clothing & Jackets',
  'Glasses & Sunglasses',
  'Jewelry & Watches',
  'Water Bottles & Flasks',
  'Books & Notebooks',
  'Sports & Fitness',
  'Umbrellas',
  'Documents & Paperwork',
  'Musical Instruments',
  'Other'
];

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  id?: string;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  required = false,
  placeholder = 'Start typing or select a category...',
  id = 'category'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = PRESET_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(value.toLowerCase())
  );

  const isExactMatch = PRESET_CATEGORIES.some(
    (cat) => cat.toLowerCase() === value.trim().toLowerCase()
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (category: string) => {
    onChange(category);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    const totalOptions = filteredCategories.length + (!isExactMatch && value.trim() ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalOptions);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? totalOptions - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredCategories.length) {
        handleSelect(filteredCategories[highlightedIndex]);
      } else if (highlightedIndex === filteredCategories.length && value.trim()) {
        handleSelect(value.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="category-select-container" ref={containerRef}>
      <div className="category-input-wrapper">
        <Tag size={18} className="category-input-icon" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="form-input category-input"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        <button
          type="button"
          className="category-toggle-btn"
          onClick={() => {
            setIsOpen(!isOpen);
            inputRef.current?.focus();
          }}
          aria-label="Toggle categories"
        >
          <ChevronDown size={18} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <ul className="category-dropdown-menu" role="listbox">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => {
              const isSelected = value.toLowerCase() === category.toLowerCase();
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={category}
                  role="option"
                  aria-selected={isSelected}
                  className={`category-option ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(category)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className="category-option-text">{category}</span>
                  {isSelected && <Check size={16} className="category-check-icon" />}
                </li>
              );
            })
          ) : null}

          {!isExactMatch && value.trim() && (
            <li
              role="option"
              className={`category-option custom-category ${
                highlightedIndex === filteredCategories.length ? 'highlighted' : ''
              }`}
              onClick={() => handleSelect(value.trim())}
              onMouseEnter={() => setHighlightedIndex(filteredCategories.length)}
            >
              <span className="category-option-text">
                Use custom: <strong>"{value.trim()}"</strong>
              </span>
            </li>
          )}

          {filteredCategories.length === 0 && !value.trim() && (
            <li className="category-no-options">Start typing to see category suggestions</li>
          )}
        </ul>
      )}

      {/* Quick Category Chips */}
      <div className="category-quick-chips">
        <span className="chips-label">Popular:</span>
        {['Electronics', 'Wallets & Purses', 'Keys & Keychains', 'IDs & Cards', 'Bags & Backpacks'].map((chip) => (
          <button
            key={chip}
            type="button"
            className={`category-chip ${value === chip ? 'active' : ''}`}
            onClick={() => handleSelect(chip)}
          >
            {chip.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
};
