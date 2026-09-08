import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { Post, PostType } from '../../models';
import { PostTypeBadge } from '../PostTypeBadge/PostTypeBadge';
import './PostCard.css';

interface PostCardProps {
  post: Post;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours ago";
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export function PostCard({ post }: PostCardProps) {
  const isLost = post.type === PostType.LOST;

  return (
    <article className={`post-card ${isLost ? 'post-card-lost' : 'post-card-found'}`}>
      <Link to={`/post/${post.id}`} className="post-card-link">
        <div className={`post-card-image ${!post.pictureUrl ? (isLost ? 'bg-lost' : 'bg-found') : ''}`}>
          {post.pictureUrl ? (
            <img src={post.pictureUrl} alt={post.title} loading="lazy" />
          ) : (
            <span className="post-card-placeholder">No Image</span>
          )}
        </div>
        
        <div className="post-card-content">
          <div className="post-card-header">
            <PostTypeBadge type={post.type} size="sm" />
            <span className="post-card-category">{post.category}</span>
          </div>
          
          <h3 className="post-card-title">{post.title}</h3>
          
          <div className="post-card-meta">
            <div className="meta-item">
              <MapPin size={16} />
              <span>{post.location}</span>
            </div>
            <div className="meta-item">
              <Clock size={16} />
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
