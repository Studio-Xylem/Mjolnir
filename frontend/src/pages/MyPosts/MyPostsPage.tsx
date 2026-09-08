import React, { useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getMyPosts } from '../../services/posts';
import { PostCard } from '../../components/PostCard/PostCard';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import './MyPostsPage.css';

export const MyPostsPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchPosts = useCallback(() => getMyPosts(), []);
  const { data: posts, isLoading, error, retry } = useApi(fetchPosts, [fetchPosts]);

  if (authLoading || !isAuthenticated) return null;

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
