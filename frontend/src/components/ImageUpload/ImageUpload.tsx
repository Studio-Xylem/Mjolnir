import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import { uploadImage } from '../../services/uploads';
import './ImageUpload.css';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onClear: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const url = await uploadImage(file, (p) => setProgress(p));
      onChange(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setProgress(100);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="image-upload-container">
      {value ? (
        <div className="image-upload-preview">
          <img src={value} alt="Uploaded preview" />
          <button type="button" onClick={onClear} aria-label="Remove image">
            <X size={20} />
          </button>
        </div>
      ) : isUploading ? (
        <div className="image-upload-progress" aria-live="polite">
          <p>Uploading... {progress}%</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      ) : (
        <div
          className={`image-upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          aria-label="Drag and drop an image, or click to browse"
        >
          <UploadCloud size={32} />
          <p>Click or drag image here to upload</p>
          <span className="file-hint">Accepts images up to 5MB</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onChangeFile}
            accept="image/*"
            className="hidden-input"
            aria-hidden="true"
          />
        </div>
      )}
      {error && (
        <div className="image-upload-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
