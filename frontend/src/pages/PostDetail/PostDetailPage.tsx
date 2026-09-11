import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, MapPin, Tag, Calendar, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { getPost, resolvePost } from '../../services/posts';
import { PostStatus, PostType } from '../../models';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import './PostDetailPage.css';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const fetchPost = useCallback(() => getPost(id!), [id]);
  const { data: post, isLoading, error, retry } = useApi(fetchPost, [fetchPost]);

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResolve = async () => {
    if (!post) return;
    setIsResolving(true);
    try {
      await resolvePost(post.id);
      retry();
      setIsResolveDialogOpen(false);
    } catch (err) {
      alert('Failed to resolve post.'); // Replace with toast
    } finally {
      setIsResolving(false);
    }
  };

  if (isLoading) return <div className="post-detail-page"><LoadingState message="Loading post..." /></div>;
  
  if (error || !post) {
    return (
      <div className="post-detail-page">
        <ErrorState 
          message={error?.message || 'Post not found'} 
          onRetry={error ? retry : () => navigate('/')} 
        />
      </div>
    );
  }

  const isOwner = user && post.userId === user.id;
  const isLost = post.type === PostType.LOST;
  const isResolved = post.status === PostStatus.RESOLVED;

  return (
    <div className="post-detail-page">
      <button onClick={() => navigate(-1)} className="back-link">
        <ChevronLeft size={20} /> Back to feed
      </button>

      <article className="post-detail-content">
        <div className={`post-image-container ${!post.pictureUrl ? (isLost ? 'lost-bg' : 'found-bg') : ''}`}>
          {post.pictureUrl ? (
            <img src={post.pictureUrl} alt={post.title} className="post-image" onClick={() => window.open(post.pictureUrl, '_blank')} />
          ) : (
            <div className="post-image-placeholder">
              <ImageIcon size={64} />
            </div>
          )}
        </div>

        <div className="post-info">
          <header className="post-header">
            <div className="post-badges">
              <span className={`type-badge ${isLost ? 'lost' : 'found'}`}>
                {post.type}
              </span>
              <span className={`status-badge ${isResolved ? 'resolved' : 'active'}`}>
                <span className="dot"></span>
                {post.status}
              </span>
            </div>
            <h1 className="post-title">{post.title}</h1>
            <p className="post-date">
              <Calendar size={16} />
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </header>

          <div className="post-metadata">
            <div className="meta-item">
              <Tag size={20} />
              <div>
                <span className="meta-label">Category</span>
                <span className="meta-value">{post.category}</span>
              </div>
            </div>
            <div className="meta-item">
              <MapPin size={20} />
              <div>
                <span className="meta-label">Location</span>
                <span className="meta-value">{post.location}</span>
              </div>
            </div>
          </div>

          <div className="post-description">
            <h2 className="section-title">Description</h2>
            <p>{post.description}</p>
          </div>

          <div className="post-actions">
            <button className="btn-secondary" onClick={handleCopyLink}>
              <Share2 size={20} /> {copied ? 'Copied!' : 'Share'}
            </button>
            
            {isOwner && !isResolved && (
              <button 
                className="btn-primary" 
                onClick={() => setIsResolveDialogOpen(true)}
              >
                Resolve Item
              </button>
            )}
          </div>
        </div>
      </article>

      <ConfirmDialog
        open={isResolveDialogOpen}
        title="Resolve Item"
        description="Are you sure you want to mark this item as resolved? This action cannot be undone."
        confirmLabel="Yes, resolve it"
        onConfirm={handleResolve}
        onCancel={() => setIsResolveDialogOpen(false)}
        isLoading={isResolving}
      />
    </div>
  );
};
