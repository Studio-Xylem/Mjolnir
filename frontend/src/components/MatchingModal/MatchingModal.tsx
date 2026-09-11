import React from 'react';
import { Sparkles, MapPin, Calendar, Tag, Shield, ExternalLink, ArrowRight, X } from 'lucide-react';
import { Post } from '../../models';
import './MatchingModal.css';

interface MatchingModalProps {
  isOpen: boolean;
  matches: Post[];
  onDismiss: () => void;
  onViewMatch: (postId: string) => void;
}

export const MatchingModal: React.FC<MatchingModalProps> = ({
  isOpen,
  matches,
  onDismiss,
  onViewMatch,
}) => {
  if (!isOpen || matches.length === 0) return null;

  return (
    <div className="matching-modal-overlay" onClick={onDismiss}>
      <div className="matching-modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="matching-modal-close" onClick={onDismiss} aria-label="Close matches">
          <X size={20} />
        </button>

        <header className="matching-modal-header">
          <div className="matching-icon-badge">
            <Sparkles size={24} />
          </div>
          <h2 className="matching-modal-title">Potential Matches Found!</h2>
          <p className="matching-modal-subtitle">
            We discovered <strong>{matches.length} found item{matches.length > 1 ? 's' : ''}</strong> that match your lost report. Please check if any of these are yours before continuing:
          </p>
        </header>

        <div className="matching-cards-list">
          {matches.map((post) => (
            <article key={post.id} className="matching-card">
              <div className="matching-card-media">
                {post.pictureUrl ? (
                  <img src={post.pictureUrl} alt={post.title} className="matching-img" />
                ) : (
                  <div className="matching-img-placeholder">Found Item</div>
                )}
              </div>

              <div className="matching-card-body">
                <div className="matching-card-top">
                  <span className="matching-category-tag">
                    <Tag size={12} /> {post.category}
                  </span>
                  {post.lostOrFoundAt && (
                    <span className="matching-datetime">
                      <Calendar size={12} />
                      Found at: {new Date(post.lostOrFoundAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  )}
                </div>

                <h3 className="matching-card-title">{post.title}</h3>
                <p className="matching-card-desc">{post.description}</p>

                <div className="matching-card-meta">
                  <div className="matching-meta-item">
                    <MapPin size={14} />
                    <span>{post.location}</span>
                  </div>
                  {post.currentCustody && (
                    <div className="matching-meta-item custody">
                      <Shield size={14} />
                      <span>Custody: <strong>{post.currentCustody}</strong></span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="matching-view-btn"
                  onClick={() => onViewMatch(post.id)}
                >
                  <span>View Details</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <footer className="matching-modal-footer">
          <button type="button" className="btn-secondary" onClick={onDismiss}>
            None of these are mine &bull; Continue to my post <ArrowRight size={16} />
          </button>
        </footer>
      </div>
    </div>
  );
};
