import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Share2, 
  MapPin, 
  Tag, 
  Calendar, 
  ChevronLeft, 
  Image as ImageIcon,
  Pencil,
  Trash2,
  Shield,
  CheckCircle2,
  Clock,
  Phone,
  Sparkles
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { getPost, resolvePost, deletePost, getMatchingFoundPosts } from '../../services/posts';
import { PostStatus, PostType, Post } from '../../models';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { PostCard } from '../../components/PostCard/PostCard';
import { useToast } from '../../components/Toast/Toast';
import './PostDetailPage.css';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPost = useCallback(() => getPost(id!), [id]);
  const { data: post, isLoading, error, retry } = useApi(fetchPost, [fetchPost]);

  const [copied, setCopied] = useState(false);
  const [matchingFoundPosts, setMatchingFoundPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (post && post.type === PostType.LOST) {
      getMatchingFoundPosts({
        id: post.id,
        title: post.title,
        category: post.category,
        location: post.location,
        description: post.description,
        lostAt: post.lostAt,
      })
        .then((matches) => setMatchingFoundPosts(matches))
        .catch(() => setMatchingFoundPosts([]));
    }
  }, [post]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    addToast('Link copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResolve = async () => {
    if (!post) return;
    setIsResolving(true);
    try {
      await resolvePost(post.id);
      addToast('Item marked as resolved!', 'success');
      retry();
      setIsResolveDialogOpen(false);
    } catch (err: any) {
      addToast(err.message || 'Failed to resolve post.', 'error');
    } finally {
      setIsResolving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
      await deletePost(post.id);
      addToast('Post deleted successfully.', 'success');
      setIsDeleteDialogOpen(false);
      navigate('/my-posts', { replace: true });
    } catch (err: any) {
      addToast(err.message || 'Failed to delete post.', 'error');
    } finally {
      setIsDeleting(false);
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
        <ChevronLeft size={20} /> Back
      </button>

      <article className="post-detail-content">
        <div className={`post-image-container ${!post.pictureUrl ? (isLost ? 'lost-bg' : 'found-bg') : ''}`}>
          {post.pictureUrl ? (
            <img 
              src={post.pictureUrl} 
              alt={post.title} 
              className="post-image" 
              onClick={() => window.open(post.pictureUrl, '_blank')} 
              title="Click to view full image"
            />
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
              {/* Only show RESOLVED status for lost items; active status is removed */}
              {isLost && isResolved && (
                <span className="status-badge resolved">
                  <CheckCircle2 size={14} />
                  Resolved
                </span>
              )}
            </div>
            <h1 className="post-title">{post.title}</h1>
            <p className="post-date">
              <Calendar size={16} />
              Reported on {new Date(post.createdAt).toLocaleDateString()}
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

            {/* Lost At / Found At specific Date and Time */}
            {(isLost ? post.lostAt : post.foundAt) && (
              <div className="meta-item">
                <Clock size={20} />
                <div>
                  <span className="meta-label">{isLost ? 'Lost At' : 'Found At'}</span>
                  <span className="meta-value">
                    {new Date((isLost ? post.lostAt : post.foundAt)!).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            )}

            {/* Custody information for found posts */}
            {(!isLost || post.currentCustody) && (
              <div className="meta-item">
                <Shield size={20} />
                <div>
                  <span className="meta-label">Current Custody</span>
                  <span className="meta-value">{post.currentCustody || 'With finder'}{post.custodyLocation ? `: ${post.custodyLocation}` : ''}</span>
                </div>
              </div>
            )}

            {/* Finder's Contact Details (shown when self custody was chosen) */}
            {post.contactValue && (
              <div className="meta-item contact-highlight">
                <Phone size={20} />
                <div>
                  <span className="meta-label">Finder's Contact</span>
                  <span className="meta-value contact-text">{post.contactType === 'EMAIL' ? 'Email' : 'Phone'}: {post.contactValue}</span>
                </div>
              </div>
            )}
          </div>

          <div className="post-description">
            <h2 className="section-title">Description</h2>
            <p>{post.description}</p>
          </div>

          <div className="post-actions">
            <button className="btn-secondary" onClick={handleCopyLink}>
              <Share2 size={18} /> {copied ? 'Copied!' : 'Share'}
            </button>
            
            {/* Owner controls: Edit and Delete */}
            {isOwner && (
              <>
                <button 
                  className="btn-secondary" 
                  onClick={() => navigate(`/post/${post.id}/edit`)}
                >
                  <Pencil size={18} /> Edit Post
                </button>

                <button 
                  className="btn-danger-outline" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 size={18} /> Delete
                </button>
              </>
            )}

            {/* Only LOST posts have a resolve option when not yet resolved */}
            {isOwner && isLost && !isResolved && (
              <button 
                className="btn-primary" 
                onClick={() => setIsResolveDialogOpen(true)}
              >
                Mark as Resolved
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Potential Matches for Lost Items */}
      {isLost && matchingFoundPosts.length > 0 && (
        <section className="potential-matches-container">
          <div className="potential-matches-banner">
            <Sparkles size={22} className="sparkle-icon" />
            <div>
              <h2 className="matches-heading">Potential Matches Found in Database ({matchingFoundPosts.length})</h2>
              <p className="matches-subheading">
                These found items match the category, location, or keywords of your lost report:
              </p>
            </div>
          </div>

          <div className="matches-grid">
            {matchingFoundPosts.map((match) => (
              <PostCard key={match.id} post={match} />
            ))}
          </div>
        </section>
      )}

      {/* Resolve Confirmation Dialog */}
      <ConfirmDialog
        open={isResolveDialogOpen}
        title="Resolve Lost Item"
        description="Have you recovered or found this item? Marking it as resolved will let the community know this listing is concluded."
        confirmLabel="Yes, mark resolved"
        onConfirm={handleResolve}
        onCancel={() => setIsResolveDialogOpen(false)}
        isLoading={isResolving}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete Post"
        description="Are you sure you want to delete this listing? This action cannot be undone."
        confirmLabel="Yes, delete it"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={isDeleting}
      />
    </div>
  );
};
