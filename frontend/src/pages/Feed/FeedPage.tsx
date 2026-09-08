import React, { useState, useMemo, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { getPosts } from '../../services/posts';
import { PostType } from '../../models';
import { PostCard } from '../../components/PostCard/PostCard';
import { SearchInput } from '../../components/SearchInput';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import './FeedPage.css';

export const FeedPage: React.FC = () => {
  const [filterType, setFilterType] = useState<'ALL' | PostType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchPosts = useCallback(() => {
    return getPosts(filterType === 'ALL' ? undefined : filterType);
  }, [filterType]);

  const { data: posts, isLoading, error, retry } = useApi(fetchPosts, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!debouncedSearch) return posts;
    
    const query = debouncedSearch.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.location.toLowerCase().includes(query)
    );
  }, [posts, debouncedSearch]);

  return (
    <div className="feed-page">
      <div className="feed-header">
        <h1 className="feed-title">Lost & Found</h1>
        
        <div className="feed-controls">
          <div className="filter-bar" role="group" aria-label="Filter posts by type">
            <button 
              className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterType('ALL')}
              aria-pressed={filterType === 'ALL'}
            >
              All
            </button>
            <button 
              className={`filter-btn lost ${filterType === PostType.LOST ? 'active' : ''}`}
              onClick={() => setFilterType(PostType.LOST)}
              aria-pressed={filterType === PostType.LOST}
            >
              Lost
            </button>
            <button 
              className={`filter-btn found ${filterType === PostType.FOUND ? 'active' : ''}`}
              onClick={() => setFilterType(PostType.FOUND)}
              aria-pressed={filterType === PostType.FOUND}
            >
              Found
            </button>
          </div>
          
          <div className="search-container">
            <SearchInput 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search items, categories, locations..."
            />
          </div>
        </div>
      </div>

      <div className="feed-content">
        {isLoading ? (
          <LoadingState message="Loading posts..." />
        ) : error ? (
          <ErrorState message={error.message || 'Failed to load posts'} onRetry={retry} />
        ) : filteredPosts.length > 0 ? (
          <div className="feed-grid">
            {filteredPosts.map(post => (
              <div key={post.id} className="feed-card-wrapper">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title={posts && posts.length > 0 ? "No items match your search" : "No active posts yet"}
            message={posts && posts.length > 0 ? "Try adjusting your search terms" : "Be the first to report a lost or found item."}
          />
        )}
      </div>
    </div>
  );
};
