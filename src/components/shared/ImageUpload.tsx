import React, { useState, useRef } from 'react';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  onRemoveImage: () => void;
  showControls?: boolean;
  onToggleControls?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUpload, 
  currentImage, 
  onRemoveImage,
  showControls,
  onToggleControls,
  isMinimized,
  onToggleMinimize
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    console.log('Processing image file:', file.name, file.size, file.type);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('Image converted to data URL, length:', result.length);
      setPreviewUrl(result);
      onImageUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemoveImage();
  };

  return (
    <div className={`${styles.container} ${isMinimized ? styles.minimized : ''}`}>
      {isMinimized ? (
        <button
          onClick={onToggleMinimize}
          className={styles.cameraButton}
          title="Upload Wall Image"
        >
          📷
        </button>
      ) : (
        <>
          <div className={styles.header}>
            <div>
              <h4 className={styles.title}>Upload Your Wall Image</h4>
              <p className={styles.description}>
                Upload a photo of your wall to see how the peg wall will look in your space
              </p>
            </div>
            <div className={styles.headerButtons}>
              {currentImage && onToggleControls && (
                <button
                  onClick={onToggleControls}
                  className={styles.settingsButton}
                  title="Adjust Background Image"
                >
                  {showControls ? '🔧' : '⚙️'}
                </button>
              )}
              {onToggleMinimize && (
                <button
                  onClick={onToggleMinimize}
                  className={styles.minimizeButton}
                  title="Minimize"
                >
                  −
                </button>
              )}
            </div>
          </div>
      
                          {previewUrl ? (
              <div className={styles.previewContainer}>
                <img 
                  src={previewUrl} 
                  alt="Wall preview" 
                  className={styles.previewImage}
                />
                <div className={styles.previewOverlay}>
                  <button 
                    onClick={handleRemove}
                    className={styles.removeButton}
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
              >
                <div className={styles.uploadContent}>
                  <div className={styles.uploadIcon}>📷</div>
                  <p className={styles.uploadText}>
                    Click to upload or drag and drop
                  </p>
                  <p className={styles.uploadSubtext}>
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className={styles.hiddenInput}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

export default ImageUpload; 