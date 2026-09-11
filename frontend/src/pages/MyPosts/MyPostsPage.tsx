import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getMyPosts } from '../../services/posts';
import { PostCard } from '../../components/PostCard/PostCard';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import './MyPostsPage.css';

import { AuthModal } from '../../components/AuthModal/AuthModal';

export const MyPostsPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchPosts = useCallback(() => getMyPosts(), []);
  const { data: posts, isLoading, error, retry } = useApi(fetchPosts, [fetchPosts, isAuthenticated]);

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="my-posts-page">
        <div className="auth-required-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>Sign in to view your posts</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Manage and track items you've reported lost or found.
          </p>
          <button className="btn-primary" onClick={() => setIsAuthModalOpen(true)}>
            Sign In / Register
          </button>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  if (authLoading) return null;

  return (
    <div className="my-posts-page">
      <div className="page-header">
        <h1 className="page-title">My Posts</h1>
        <Link to="/create" className="btn-primary">Report Item</Link>
      </div>

      <div className="my-posts-content">
        {isLoading ? (
          <LoadingState message="Loading your posts..." />
        ) : error ? (
          <ErrorState message={error.message || 'Failed to load posts'} onRetry={retry} />
        ) : posts && posts.length > 0 ? (
          <div className="posts-grid">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="You haven't reported any items yet"
            message="When you report a lost or found item, it will appear here."
            action={<Link to="/create" className="btn-primary">Create a Post</Link>}
          />
        )}
      </div>
    </div>
  );
};
