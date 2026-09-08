import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { PostCard } from '../PostCard/PostCard';
import { Post, PostType, PostStatus } from '../../models';

const dummyPost: Post = {
  id: 'post-123',
  userId: 'user-1',
  title: 'Lost Leather Wallet',
  description: 'Brown leather wallet lost near Main St.',
  category: 'Accessories',
  type: PostType.LOST,
  status: PostStatus.ACTIVE,
  location: 'Downtown Station',
  currentCustody: 'Self',
  pictureUrl: '',
  createdAt: '2026-09-08T12:00:00Z',
};

describe('PostCard Component', () => {
  it('renders post title, location, category, and type badge', () => {
    render(
      <BrowserRouter>
        <PostCard post={dummyPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Lost Leather Wallet')).toBeInTheDocument();
    expect(screen.getByText('Downtown Station')).toBeInTheDocument();
    expect(screen.getByText('Accessories')).toBeInTheDocument();
    expect(screen.getByText('LOST')).toBeInTheDocument();
  });

  it('contains a link to the detail page', () => {
    render(
      <BrowserRouter>
        <PostCard post={dummyPost} />
      </BrowserRouter>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/post/post-123');
  });
});
