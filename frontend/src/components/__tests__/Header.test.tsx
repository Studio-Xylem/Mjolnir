import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Header } from '../Layout/Header';
import { AuthProvider } from '../../context/AuthContext';

describe('Header Component', () => {
  it('renders Mjolnir title link and nav buttons', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Mjolnir')).toBeInTheDocument();
    expect(screen.getByText(/Create Post/i)).toBeInTheDocument();
  });
});
