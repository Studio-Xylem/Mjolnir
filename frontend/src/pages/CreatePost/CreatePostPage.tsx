import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createPost, createLostPost, getMatchingFoundPosts } from '../../services/posts';
import { ContactType, CurrentCustody, PostType, Post } from '../../models';
import { ImageUpload } from '../../components/ImageUpload/ImageUpload';
import { AuthModal } from '../../components/AuthModal/AuthModal';
import { CategorySelect } from '../../components/CategorySelect/CategorySelect';
import { MatchingModal } from '../../components/MatchingModal/MatchingModal';
import { useToast } from '../../components/Toast/Toast';
import { Shield, UserCheck, Building2, Phone, Mail, Calendar, Sparkles } from 'lucide-react';
import './CreatePostPage.css';

export const CreatePostPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [type, setType] = useState<PostType>(PostType.LOST);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [lostOrFoundAt, setLostOrFoundAt] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  // Found post custody & contact
  const [custodyType, setCustodyType] = useState<'self' | 'handed_over'>('self');
  const [custodyLocation, setCustodyLocation] = useState('Campus Security Desk');
  const [contactDetails, setContactDetails] = useState('');

  const [pictureUrl, setPictureUrl] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Matches modal state
  const [matchingFoundPosts, setMatchingFoundPosts] = useState<Post[]>([]);
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);

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
        ? custodyType === 'self' ? CurrentCustody.SELF : CurrentCustody.CUSTODY
        : undefined;
    const postData = {
      type,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      pictureUrl: pictureUrl || undefined,
      lostAt: type === PostType.LOST ? new Date(lostOrFoundAt).toISOString() : undefined,
      foundAt: type === PostType.FOUND ? new Date(lostOrFoundAt).toISOString() : undefined,
      currentCustody: calculatedCustody,
      custodyLocation: type === PostType.FOUND && custodyType !== 'self' ? custodyLocation.trim() : undefined,
      contactType: type === PostType.FOUND && custodyType === 'self'
        ? (contactDetails.includes('@') ? ContactType.EMAIL : ContactType.PHONE)
        : undefined,
      contactValue: type === PostType.FOUND && custodyType === 'self' ? contactDetails.trim() : undefined,
    };

    try {
      const result = type === PostType.LOST
        ? await createLostPost(postData)
        : { post: await createPost(postData), matches: [] };
      const newPost = result.post;

      setCreatedPostId(newPost.id);

      // If user posted a LOST item, check database for matching found posts
      if (type === PostType.LOST) {
        try {
          const matches = result.matches.length > 0 ? result.matches : await getMatchingFoundPosts({
            id: newPost.id,
            title: title.trim(),
            category: category.trim(),
            location: location.trim(),
            description: description.trim(),
            lostAt: new Date(lostOrFoundAt).toISOString(),
          });

          if (matches.length > 0) {
            setMatchingFoundPosts(matches);
            setIsMatchingModalOpen(true);
            setIsSubmitting(false);
            return;
          }
        } catch {
          // If matching query fails, continue to created post
        }
      }

      addToast('Post created successfully!', 'success');
      navigate(`/post/${newPost.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create post. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleDismissMatches = () => {
    setIsMatchingModalOpen(false);
    if (createdPostId) {
      navigate(`/post/${createdPostId}`);
    }
  };

  const handleViewMatch = (matchPostId: string) => {
    setIsMatchingModalOpen(false);
    navigate(`/post/${matchPostId}`);
  };

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="create-post-page">
        <div className="auth-required-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: '1rem' }}>Sign in to report an item</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            You need an account to publish a lost or found item listing.
          </p>
          <button className="btn-primary" onClick={() => setIsAuthModalOpen(true)}>
            Sign In / Register
          </button>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="create-post-page">
      <h1 className="page-heading">Report an Item</h1>
      
      <form onSubmit={handleSubmit} className="create-post-form">
        {error && <div className="form-error-banner">{error}</div>}
        
        {/* Type Selection */}
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
              <span className="type-card-desc">Looking for an item you misplaced.</span>
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
              <span className="type-card-desc">Found an item and want to connect it to the owner.</span>
            </label>
          </div>
        </div>

        {/* Title */}
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
            placeholder={type === PostType.LOST ? "e.g. Lost Silver MacBook Air in Library" : "e.g. Found Blue Hydroflask Bottle"}
          />
          <div className="char-counter">{title.length}/120</div>
        </div>

        {/* Category & Location */}
        <div className="form-group row">
          <div className="col">
            <label htmlFor="category" className="form-label">Category *</label>
            <CategorySelect 
              id="category"
              value={category}
              onChange={setCategory}
              required
              placeholder="Start typing or select category..."
            />
          </div>
          <div className="col">
            <label htmlFor="location" className="form-label">
              {type === PostType.LOST ? 'Last Seen Location *' : 'Found Location *'}
            </label>
            <input 
              id="location"
              type="text" 
              className="form-input"
              value={location}
              onChange={e => setLocation(e.target.value)}
              maxLength={200}
              required
              placeholder={type === PostType.LOST ? "Where did you last have it?" : "Where was it found?"}
            />
          </div>
        </div>

        {/* Date and Time: Lost At / Found At */}
        <div className="form-group">
          <label htmlFor="datetime" className="form-label">
            <Calendar size={16} className="inline-icon" />
            {type === PostType.LOST ? 'Lost At (Date & Time) *' : 'Found At (Date & Time) *'}
          </label>
          <input 
            id="datetime"
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

            {/* If Self Custody: CONTACT DETAILS FIELD */}
            {custodyType === 'self' && (
              <div className="contact-details-box">
                <label htmlFor="contact" className="form-label">
                  <Phone size={14} className="inline-icon" />
                  Your Contact Details (Phone Number or Email) *
                </label>
                <input 
                  id="contact"
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

            {/* If Handed Over: LOCATION / AUTHORITY DETAILS */}
            {custodyType === 'handed_over' && (
              <div className="handed-over-box">
                <label htmlFor="handed-location" className="form-label">
                  Authority / Office Location *
                </label>
                <input 
                  id="handed-location"
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

        {/* Description */}
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
            placeholder="Provide detailed description (color, brand, identifying marks, serial numbers...)"
          />
          <div className="char-counter">{description.length}/2000</div>
        </div>

        {/* Image Upload */}
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
            {isSubmitting ? 'Processing...' : (
              <>
                {type === PostType.LOST && <Sparkles size={16} />}
                <span>{type === PostType.LOST ? 'Report Lost & Check Matches' : 'Report Found Item'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Matching Found Items Modal */}
      <MatchingModal
        isOpen={isMatchingModalOpen}
        matches={matchingFoundPosts}
        onDismiss={handleDismissMatches}
        onViewMatch={handleViewMatch}
      />
    </div>
  );
};
