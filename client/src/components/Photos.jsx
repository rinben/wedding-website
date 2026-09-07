import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { API_BASE_URL } from '../config';
import './Photos.css';

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Feature States
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [likedPhotosLocal, setLikedPhotosLocal] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedForDownload, setSelectedForDownload] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchPhotos();
    const savedLikes = JSON.parse(localStorage.getItem('likedPhotos') || '[]');
    setLikedPhotosLocal(savedLikes);
  }, []);

  // Keyboard Navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
      
      if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) {
        setSelectedPhoto(photos[currentIndex + 1]);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedPhoto(photos[currentIndex - 1]);
      } else if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, photos]);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/photos`);
      if (res.ok) setPhotos(await res.json());
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

        if (!isVideo) {
          const options = { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true };
          fileToUpload = await imageCompression(file, options);
        }

        setUploadStatus(`Securing upload link for ${file.name}...`);
        const urlRes = await fetch(`${API_BASE_URL}/api/photos/presigned-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: fileToUpload.name, contentType: file.type })
        });
        const { presigned_url, public_url } = await urlRes.json();

        setUploadStatus(`Uploading ${file.name} to gallery...`);
        await fetch(presigned_url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: fileToUpload
        });

        await fetch(`${API_BASE_URL}/api/photos/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_url, guest_name: guestName || 'Anonymous', file_type: isVideo ? 'video' : 'image' })
        });
      } catch (error) {
        setUploadStatus(`Error uploading ${file.name}.`);
        return;
      }
    }
    setUploadStatus('Upload complete! Your memories are being reviewed.');
  }, [guestName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleLike = async (photoId, e) => {
    if(e) e.stopPropagation();
    const isLiked = likedPhotosLocal.includes(photoId);
    const action = isLiked ? 'unlike' : 'like';

    try {
      const res = await fetch(`${API_BASE_URL}/api/photos/${photoId}/like`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (res.ok) {
        const { likes } = await res.json();
        
        let updatedLocalLikes;
        if (isLiked) {
          updatedLocalLikes = likedPhotosLocal.filter(id => id !== photoId);
        } else {
          updatedLocalLikes = [...likedPhotosLocal, photoId];
        }
        
        setLikedPhotosLocal(updatedLocalLikes);
        localStorage.setItem('likedPhotos', JSON.stringify(updatedLocalLikes));
        
        setPhotos(photos.map(p => p.id === photoId ? { ...p, likes } : p));
        if (selectedPhoto && selectedPhoto.id === photoId) {
          setSelectedPhoto({ ...selectedPhoto, likes });
        }
      }
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleSingleDownload = async (url, e) => {
    if(e) e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = url.split('/').pop() || 'wedding-memory.jpg';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch(err) {
      window.open(url, '_blank');
    }
  };

  const handleMassDownload = async () => {
    setIsDownloading(true);
    const zip = new JSZip();
    const urlsToDownload = photos.filter(p => selectedForDownload.includes(p.id));

    try {
      for (let i = 0; i < urlsToDownload.length; i++) {
        const photo = urlsToDownload[i];
        const response = await fetch(photo.image_url);
        const blob = await response.blob();
        const filename = photo.image_url.split('/').pop() || `photo_${i}.jpg`;
        zip.file(filename, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, "Wedding_Photos.zip");
    } catch (err) {
      alert("Error generating zip file. Some files may be too large.");
    }
    
    setIsDownloading(false);
    setIsSelectMode(false);
    setSelectedForDownload([]);
  };

  // On-screen button navigation
  const handleNext = (e) => {
    if(e) e.stopPropagation();
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex < photos.length - 1) setSelectedPhoto(photos[currentIndex + 1]);
  };

  const handlePrev = (e) => {
    if(e) e.stopPropagation();
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex > 0) setSelectedPhoto(photos[currentIndex - 1]);
  };

  const handleThumbnailClick = (photo) => {
    if (isSelectMode) {
      setSelectedForDownload(prev => 
        prev.includes(photo.id) ? prev.filter(id => id !== photo.id) : [...prev, photo.id]
      );
    } else {
      setSelectedPhoto(photo);
    }
  };

  const isVideoFile = (url, type) => {
  if (type === 'video') return true;
  return typeof url === 'string' && url.match(/\.(mp4|mov|webm|ogg)$/i);
};

  return (
    <div className="photos-container">
      <div className="photos-header">
        <h2>Wedding Gallery</h2>
        <div className="header-actions">
          <button 
            onClick={() => { setIsSelectMode(!isSelectMode); setSelectedForDownload([]); }} 
            className="secondary-btn"
          >
            {isSelectMode ? 'Cancel Selection' : 'Select Photos'}
          </button>
          
          <button onClick={() => setIsUploadOpen(true)} className="upload-btn">
            Share Your Photos
          </button>
        </div>
      </div>

      {isSelectMode && selectedForDownload.length > 0 && (
        <div className="selection-bar">
          <span>{selectedForDownload.length} items selected</span>
          <button onClick={handleMassDownload} disabled={isDownloading} className="download-batch-btn">
            {isDownloading ? 'Zipping Files...' : 'Download Selected'}
          </button>
        </div>
      )}

      <div className="photo-grid">
        {photos.map(photo => {
          const isSelected = selectedForDownload.includes(photo.id);
          return (
            <div 
              key={photo.id} 
              className={`photo-thumbnail ${isSelectMode ? 'selectable' : ''} ${isSelected ? 'selected' : ''}`} 
              onClick={() => handleThumbnailClick(photo)}
            >
              {isSelected && <div className="checkmark">✓</div>}
              {isVideoFile(photo.image_url, photo.file_type) ? (
                <video src={photo.image_url} autoPlay muted playsInline loop className="gallery-video-thumb" />
              ) : (
                <img src={photo.image_url} alt="Wedding moment" loading="lazy" />
              )}
            </div>
          )
        })}
        {photos.length === 0 && <p>No photos have been approved yet. Be the first to share!</p>}
      </div>

      {isUploadOpen && (
        <div className="modal-overlay" style={{zIndex: 1100}}>
          <div className="modal-content">
            <button className="close-btn" onClick={() => { setIsUploadOpen(false); setUploadStatus(''); }}>&times;</button>
            <h3>Upload Memories</h3>
            <input type="text" placeholder="Your Name (optional)" value={guestName} onChange={e => setGuestName(e.target.value)} className="name-input" />
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <p>Drag & drop photos/videos here, or click to select files</p>
            </div>
            {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
          </div>
        </div>
      )}

      {selectedPhoto && !isSelectMode && (
        <div className="lightbox-overlay">
          <button className="close-btn" onClick={() => setSelectedPhoto(null)}>&times;</button>
          
          <button className="nav-arrow left" onClick={handlePrev} disabled={photos.findIndex(p => p.id === selectedPhoto.id) === 0}>&larr;</button>
          <button className="nav-arrow right" onClick={handleNext} disabled={photos.findIndex(p => p.id === selectedPhoto.id) === photos.length - 1}>&rarr;</button>

          <div className="lightbox-content">
            {isVideoFile(selectedPhoto.image_url, selectedPhoto.file_type) ? (
              <video src={selectedPhoto.image_url} controls autoPlay playsInline />
            ) : (
               <img src={selectedPhoto.image_url} alt="Full size" />
            )}
            
            <div className="lightbox-controls">
              <p>Uploaded by: {selectedPhoto.guest_name}</p>
              <div className="lightbox-actions">
                <button 
                  onClick={(e) => handleLike(selectedPhoto.id, e)}
                  className={`like-btn ${likedPhotosLocal.includes(selectedPhoto.id) ? 'liked' : ''}`}
                >
                  ♥ {selectedPhoto.likes}
                </button>
                <button onClick={(e) => handleSingleDownload(selectedPhoto.image_url, e)}>
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