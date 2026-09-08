import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../services/posts';
import { PostType } from '../../models';
import { ImageUpload } from '../../components/ImageUpload/ImageUpload';
import './CreatePostPage.css';

export const CreatePostPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState<PostType>(PostType.LOST);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      alert('You must be logged in to create a post.'); // Replace with toast
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !location) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newPost = await createPost({
        type,
        title,
        description,
        category,
        location,
        pictureUrl: pictureUrl || undefined,
      });
      alert('Post created successfully!');
      navigate(`/post/${newPost.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create post. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="create-post-page">
      <h1 className="page-heading">Report an Item</h1>
      
      <form onSubmit={handleSubmit} className="create-post-form">
        {error && <div className="form-error-banner">{error}</div>}
        
        <div className="form-group type-selection">
          <label className="form-label">What are you reporting? *</label>
          <div className="type-cards">
            <label className={`type-card ${type === PostType.LOST ? 'selected lost' : ''}`}>
              <input 
                type="radio" 
                name="type" 
                value={PostType.LOST}
                checked={type === PostType.LOST}
                onChange={() => setType(PostType.LOST)}
              />
              <span className="type-card-title">I Lost Something</span>
              <span className="type-card-desc">You are looking for an item you lost.</span>
            </label>
            <label className={`type-card ${type === PostType.FOUND ? 'selected found' : ''}`}>
              <input 
                type="radio" 
                name="type" 
                value={PostType.FOUND}
                checked={type === PostType.FOUND}
                onChange={() => setType(PostType.FOUND)}
              />
              <span className="type-card-title">I Found Something</span>
              <span className="type-card-desc">You found an item and want to return it.</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="title" className="form-label">Title *</label>
          <input 
            id="title"
            type="text" 
            className="form-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={120}
            required
            placeholder="e.g. Blue Hydroflask Water Bottle"
          />
          <div className="char-counter">{title.length}/120</div>
        </div>

        <div className="form-group row">
          <div className="col">
            <label htmlFor="category" className="form-label">Category *</label>
            <input 
              id="category"
              type="text" 
              className="form-input"
              value={category}
              onChange={e => setCategory(e.target.value)}
              maxLength={80}
              required
              placeholder="e.g. Electronics, Clothing"
            />
          </div>
          <div className="col">
            <label htmlFor="location" className="form-label">Location *</label>
            <input 
              id="location"
              type="text" 
              className="form-input"
              value={location}
              onChange={e => setLocation(e.target.value)}
              maxLength={200}
              required
              placeholder="Where was it lost/found?"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description *</label>
          <textarea 
            id="description"
            className="form-input textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={2000}
            required
            rows={5}
            placeholder="Provide detailed description (color, brand, identifying marks...)"
          />
          <div className="char-counter">{description.length}/2000</div>
        </div>

        <div className="form-group">
          <label className="form-label">Image (Optional)</label>
          <ImageUpload 
            value={pictureUrl} 
            onChange={setPictureUrl} 
            onClear={() => setPictureUrl('')} 
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};
