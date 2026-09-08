import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Header } from '../Layout/Header';

describe('Header Component', () => {
  it('renders Mjolnir title link and report button', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText('Mjolnir')).toBeInTheDocument();
    expect(screen.getByText(/Create Post/i)).toBeInTheDocument();
    expect(screen.getByText(/My Posts/i)).toBeInTheDocument();
  });
});
