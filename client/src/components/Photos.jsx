// src/components/Photos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { API_BASE_URL } from '../config';
import './Photos.css';

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Lightbox State
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/photos`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (err) {
      console.error("Failed to fetch photos:", err);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploadStatus('Processing files...');
    
    for (const file of acceptedFiles) {
      try {
        let fileToUpload = file;
        const isVideo = file.type.startsWith('video/');

        // Only compress images. Videos upload as-is.
        if (!isVideo) {
          const options = { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true };
          fileToUpload = await imageCompression(file, options);
        }

        // 1. Get R2 Presigned URL from Flask
        setUploadStatus(`Securing upload link for ${file.name}...`);
        const urlRes = await fetch(`${API_BASE_URL}/api/photos/presigned-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: fileToUpload.name, contentType: file.type })
        });
        const { presigned_url, public_url } = await urlRes.json();

        // 2. Upload directly to Cloudflare R2
        setUploadStatus(`Uploading ${file.name} to gallery...`);
        await fetch(presigned_url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: fileToUpload
        });

        // 3. Confirm with Flask Database
        await fetch(`${API_BASE_URL}/api/photos/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            public_url, 
            guest_name: guestName || 'Anonymous',
            file_type: isVideo ? 'video' : 'image'
          })
        });

      } catch (error) {
        console.error("Upload error:", error);
        setUploadStatus(`Error uploading ${file.name}.`);
        return;
      }
    }
    setUploadStatus('Upload complete! Your memories are being reviewed.');
  }, [guestName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleLike = async (photoId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/photos/${photoId}/like`, { method: 'PATCH' });
      if (res.ok) {
        const { likes } = await res.json();
        // Update local state to reflect the new like count instantly
        setPhotos(photos.map(p => p.id === photoId ? { ...p, likes } : p));
        if (selectedPhoto && selectedPhoto.id === photoId) {
          setSelectedPhoto({ ...selectedPhoto, likes });
        }
      }
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleDownload = (url) => {
    // Opens image in new tab to allow mobile/desktop download
    window.open(url, '_blank');
  };

  return (
    <div className="photos-container">
      <div className="photos-header">
        <h2>Wedding Gallery</h2>
        <button onClick={() => setIsUploadOpen(true)} className="upload-btn">
          Share Your Photos
        </button>
      </div>

      {/* CSS Grid Gallery */}
      <div className="photo-grid">
        {photos.map(photo => (
          <div key={photo.id} className="photo-thumbnail" onClick={() => setSelectedPhoto(photo)}>
            {photo.file_type === 'video' ? (
              <video src={photo.image_url} muted loop />
            ) : (
              <img src={photo.image_url} alt="Wedding moment" loading="lazy" />
            )}
          </div>
        ))}
        {photos.length === 0 && <p>No photos have been approved yet. Be the first to share!</p>}
      </div>

      {/* Upload Modal Overlay */}
      {isUploadOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => { setIsUploadOpen(false); setUploadStatus(''); }}>&times;</button>
            <h3>Upload Memories</h3>
            <input 
              type="text" 
              placeholder="Your Name (optional)" 
              value={guestName} 
              onChange={e => setGuestName(e.target.value)}
              className="name-input"
            />
            
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <p>Drag & drop photos/videos here, or click to select files</p>
            </div>
            
            {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
          </div>
        </div>
      )}

      {/* Lightbox / Full-size Modal */}
      {selectedPhoto && (
        <div className="lightbox-overlay">
          <button className="close-btn" onClick={() => setSelectedPhoto(null)}>&times;</button>
          
          <div className="lightbox-content">
            {selectedPhoto.file_type === 'video' ? (
              <video src={selectedPhoto.image_url} controls autoPlay />
            ) : (
               <img src={selectedPhoto.image_url} alt="Full size" />
            )}
            
            <div className="lightbox-controls">
              <p>Uploaded by: {selectedPhoto.guest_name}</p>
              <div className="lightbox-actions">
                <button onClick={() => handleLike(selectedPhoto.id)}>
                  ♥ {selectedPhoto.likes}
                </button>
                <button onClick={() => handleDownload(selectedPhoto.image_url)}>
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}