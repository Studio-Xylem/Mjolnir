import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { PostType } from '../../models';
import './PostTypeBadge.css';

interface PostTypeBadgeProps {
  type: PostType;
  size?: 'sm' | 'md';
}

export function PostTypeBadge({ type, size = 'md' }: PostTypeBadgeProps) {
  const isLost = type === PostType.LOST;
  
  return (
    <div 
      className={`post-type-badge badge-${type.toLowerCase()} badge-${size}`}
      role="status"
      title={type}
    >
      <span className="sr-only">Type: {type}</span>
      {isLost ? (
        <AlertTriangle size={size === 'sm' ? 14 : 18} aria-hidden="true" />
      ) : (
        <CheckCircle size={size === 'sm' ? 14 : 18} aria-hidden="true" />
      )}
    </div>
  );
}
