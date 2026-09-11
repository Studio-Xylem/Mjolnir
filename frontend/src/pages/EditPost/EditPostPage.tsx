import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Calendar, Shield, UserCheck, Building2, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPost, updatePost } from '../../services/posts';
import { PostType, Post } from '../../models';
import { ImageUpload } from '../../components/ImageUpload/ImageUpload';
import { CategorySelect } from '../../components/CategorySelect/CategorySelect';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { useToast } from '../../components/Toast/Toast';
import './EditPostPage.css';

export const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [type, setType] = useState<PostType>(PostType.LOST);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [lostOrFoundAt, setLostOrFoundAt] = useState('');

  // Custody & contact
  const [custodyType, setCustodyType] = useState<'self' | 'handed_over'>('self');
  const [custodyLocation, setCustodyLocation] = useState('Campus Security Desk');
  const [contactDetails, setContactDetails] = useState('');

  const [pictureUrl, setPictureUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getPost(id)
      .then((data) => {
        setPost(data);
        setType(data.type);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setLocation(data.location);
        setContactDetails(data.contactDetails || '');
        setPictureUrl(data.pictureUrl || '');

        if (data.lostOrFoundAt) {
          try {
            const d = new Date(data.lostOrFoundAt);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            setLostOrFoundAt(d.toISOString().slice(0, 16));
          } catch {
            setLostOrFoundAt('');
          }
        } else {
          const now = new Date();
          now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
          setLostOrFoundAt(now.toISOString().slice(0, 16));
        }

        if (data.currentCustody) {
          if (data.currentCustody.toLowerCase().includes('self') || data.currentCustody.toLowerCase().includes('finder')) {
            setCustodyType('self');
          } else {
            setCustodyType('handed_over');
            setCustodyLocation(data.currentCustody);
          }
        }

        setIsLoading(false);
      })
      .catch((err) => {
        setFetchError(err.message || 'Failed to load post');
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading || authLoading) {
    return (
      <div className="edit-post-page">
        <LoadingState message="Loading post details..." />
      </div>
    );
  }

  if (fetchError || !post) {
    return (
      <div className="edit-post-page">
        <ErrorState
          message={fetchError || 'Post not found'}
          onRetry={() => navigate(-1)}
        />
      </div>
    );
  }

  const isOwner = user && post.userId === user.id;

  if (!isAuthenticated || !isOwner) {
    return (
      <div className="edit-post-page">
        <div className="edit-unauthorized-box">
          <h2>Permission Denied</h2>
          <p>You can only edit posts that you reported.</p>
          <button className="btn-primary" onClick={() => navigate(`/post/${post.id}`)}>
            Back to Post
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !location || !lostOrFoundAt) {
      setError('Please fill in all required fields.');
      return;
    }

    if (type === PostType.FOUND && custodyType === 'self' && !contactDetails.trim()) {
      setError('Please provide your phone number or email so the owner can contact you.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const calculatedCustody =
      type === PostType.FOUND
        ? custodyType === 'self'
          ? 'With finder (Self custody)'
          : custodyLocation.trim() || 'Handed over to authority'
        : undefined;

    try {
      await updatePost(post.id, {
        type,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        location: location.trim(),
        lostOrFoundAt,
        pictureUrl: pictureUrl || undefined,
        currentCustody: calculatedCustody,
        contactDetails: type === PostType.FOUND && custodyType === 'self' ? contactDetails.trim() : undefined,
      });

      addToast('Post updated successfully!', 'success');
      navigate(`/post/${post.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update post. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-post-page">
      <button onClick={() => navigate(`/post/${post.id}`)} className="back-link">
        <ChevronLeft size={20} /> Cancel and return to post
      </button>

      <h1 className="page-heading">Edit Post</h1>

      <form onSubmit={handleSubmit} className="edit-post-form">
        {error && <div className="form-error-banner">{error}</div>}

        <div className="form-group type-selection">
          <label className="form-label">Post Type</label>
          <div className="type-cards">
            <label className={`type-card ${type === PostType.LOST ? 'selected lost' : ''}`}>
              <input
                type="radio"
                name="type"
                value={PostType.LOST}
                checked={type === PostType.LOST}
                onChange={() => setType(PostType.LOST)}
              />
              <span className="type-card-title">Lost Item</span>
              <span className="type-card-desc">Looking for a lost possession</span>
            </label>
            <label className={`type-card ${type === PostType.FOUND ? 'selected found' : ''}`}>
              <input
                type="radio"
                name="type"
                value={PostType.FOUND}
                checked={type === PostType.FOUND}
                onChange={() => setType(PostType.FOUND)}
              />
              <span className="type-card-title">Found Item</span>
              <span className="type-card-desc">Found an item and looking for the owner</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="edit-title" className="form-label">Title *</label>
          <input
            id="edit-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
            placeholder="e.g. Blue Hydroflask Water Bottle"
          />
          <div className="char-counter">{title.length}/120</div>
        </div>

        <div className="form-group row">
          <div className="col">
            <label htmlFor="edit-category" className="form-label">Category *</label>
            <CategorySelect
              id="edit-category"
              value={category}
              onChange={setCategory}
              required
              placeholder="Start typing or select category..."
            />
          </div>
          <div className="col">
            <label htmlFor="edit-location" className="form-label">Location *</label>
            <input
              id="edit-location"
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={200}
              required
              placeholder="Where was it lost/found?"
            />
          </div>
        </div>

        {/* Date and Time: Lost At / Found At */}
        <div className="form-group">
          <label htmlFor="edit-datetime" className="form-label">
            <Calendar size={16} className="inline-icon" />
            {type === PostType.LOST ? 'Lost At (Date & Time) *' : 'Found At (Date & Time) *'}
          </label>
          <input 
            id="edit-datetime"
            type="datetime-local" 
            className="form-input"
            value={lostOrFoundAt}
            onChange={e => setLostOrFoundAt(e.target.value)}
            required
          />
        </div>

        {/* Custody Section for FOUND items */}
        {type === PostType.FOUND && (
          <div className="form-group custody-group">
            <label className="form-label">
              <Shield size={16} className="inline-icon" />
              Current Custody *
            </label>
            <div className="custody-type-radios">
              <label className={`custody-radio-card ${custodyType === 'self' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="custodyType"
                  value="self"
                  checked={custodyType === 'self'}
                  onChange={() => setCustodyType('self')}
                />
                <UserCheck size={20} className="custody-card-icon" />
                <div className="custody-card-text">
                  <strong>Self Custody</strong>
                  <span>I have the item with me</span>
                </div>
              </label>

              <label className={`custody-radio-card ${custodyType === 'handed_over' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="custodyType"
                  value="handed_over"
                  checked={custodyType === 'handed_over'}
                  onChange={() => setCustodyType('handed_over')}
                />
                <Building2 size={20} className="custody-card-icon" />
                <div className="custody-card-text">
                  <strong>Handed Over To</strong>
                  <span>Turned in to security or an office</span>
                </div>
              </label>
            </div>

            {/* If Self Custody: CONTACT DETAILS */}
            {custodyType === 'self' && (
              <div className="contact-details-box">
                <label htmlFor="edit-contact" className="form-label">
                  <Phone size={14} className="inline-icon" />
                  Your Contact Details (Phone Number or Email) *
                </label>
                <input 
                  id="edit-contact"
                  type="text" 
                  className="form-input"
                  value={contactDetails}
                  onChange={e => setContactDetails(e.target.value)}
                  placeholder="Add at your own risk"
                  required={custodyType === 'self'}
                />
                <p className="field-hint">
                  The rightful owner will use this to contact you directly to reclaim their item.
                </p>
              </div>
            )}

            {/* If Handed Over: LOCATION / AUTHORITY */}
            {custodyType === 'handed_over' && (
              <div className="handed-over-box">
                <label htmlFor="edit-handed-location" className="form-label">
                  Authority / Office Location *
                </label>
                <input 
                  id="edit-handed-location"
                  type="text" 
                  className="form-input"
                  value={custodyLocation}
                  onChange={e => setCustodyLocation(e.target.value)}
                  placeholder="e.g. Campus Security Desk, Local Police Station..."
                  required={custodyType === 'handed_over'}
                />
                <div className="custody-quick-options">
                  <span className="chips-label">Quick select:</span>
                  {['Campus Security Desk', 'Lost & Found Office', 'Police Station', 'Library Help Desk', 'Reception Desk'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      className={`category-chip ${custodyLocation === preset ? 'active' : ''}`}
                      onClick={() => setCustodyLocation(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="edit-description" className="form-label">Description *</label>
          <textarea
            id="edit-description"
            className="form-input textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            required
            rows={5}
            placeholder="Provide detailed description (color, brand, identifying marks...)"
          />
          <div className="char-counter">{description.length}/2000</div>
        </div>

        <div className="form-group">
          <label className="form-label">Image</label>
          <ImageUpload
            value={pictureUrl}
            onChange={setPictureUrl}
            onClear={() => setPictureUrl('')}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(`/post/${post.id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            <Save size={18} />
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
