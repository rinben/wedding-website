// client/src/components/AdminPhotoManager.jsx
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import './AdminPhotoManager.css';

export default function AdminPhotoManager({ token }) {
  const [photos, setPhotos] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [reviewLightbox, setReviewLightbox] = useState(null); // Fix: Admin Lightbox State

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/photos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setPhotos(await res.json());
    } catch (err) {
      console.error("Error fetching photos:", err);
    }
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    const timeKey = photo.timestamp.substring(0, 13); 
    const key = `${photo.guest_name}_${timeKey}`;
    
    if (!acc[key]) {
      acc[key] = { id: key, guest_name: photo.guest_name, timestamp: photo.timestamp, items: [], allApproved: true };
    }
    acc[key].items.push(photo);
    if (!photo.approved) acc[key].allApproved = false;
    return acc;
  }, {});

  const groups = Object.values(groupedPhotos);

  const toggleApproval = async (photoId, currentStatus) => {
    await fetch(`${API_BASE_URL}/api/admin/photos/${photoId}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ approved: !currentStatus })
    });
    fetchPhotos();
    
    if (selectedGroup) {
      setSelectedGroup(prev => ({
        ...prev,
        items: prev.items.map(p => p.id === photoId ? { ...p, approved: !currentStatus } : p)
      }));
    }
    if (reviewLightbox && reviewLightbox.id === photoId) {
       setReviewLightbox(prev => ({ ...prev, approved: !currentStatus }));
    }
  };

  const deletePhoto = async (photoId) => {
    if (!window.confirm("Permanently delete this file?")) return;
    await fetch(`${API_BASE_URL}/api/admin/photos/${photoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchPhotos();
    
    if (selectedGroup) {
      setSelectedGroup(prev => ({
        ...prev,
        items: prev.items.filter(p => p.id !== photoId)
      }));
    }
    setReviewLightbox(null); // Close lightbox if item is deleted
  };

  const approveAll = async (items) => {
    const unapproved = items.filter(p => !p.approved);
    await Promise.all(unapproved.map(p => 
      fetch(`${API_BASE_URL}/api/admin/photos/${p.id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approved: true })
      })
    ));
    fetchPhotos();
    setSelectedGroup(null); 
  };

  const denyAll = async (items) => {
    if (!window.confirm(`Permanently delete all ${items.length} files in this batch?`)) return;
    await Promise.all(items.map(p => 
      fetch(`${API_BASE_URL}/api/admin/photos/${p.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
    ));
    fetchPhotos();
    setSelectedGroup(null);
  };

  const isVideoFile = (url, type) => {
  if (type === 'video') return true;
  return typeof url === 'string' && url.match(/\.(mp4|mov|webm|ogg)$/i);
};

  return (
    <div className="admin-photo-manager">
      <h3>Review Guest Uploads</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Guest Name</th>
            <th>Date & Time</th>
            <th>Files</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr key={group.id}>
              <td>{group.guest_name}</td>
              <td>{new Date(group.timestamp).toLocaleString()}</td>
              <td>{group.items.length} item(s)</td>
              <td>
                <span className={group.allApproved ? 'status-approved' : 'status-pending'}>
                  {group.allApproved ? 'Approved' : 'Pending Review'}
                </span>
              </td>
              <td>
                <button onClick={() => setSelectedGroup(group)} className="edit-btn">Review</button>
              </td>
            </tr>
          ))}
          {groups.length === 0 && <tr><td colSpan="5">No photos uploaded yet.</td></tr>}
        </tbody>
      </table>

      {/* Group Review Modal */}
      {selectedGroup && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h3>Reviewing {selectedGroup.guest_name}'s Uploads</h3>
              <div className="batch-actions">
                <button className="approve-btn" onClick={() => approveAll(selectedGroup.items)}>Approve All</button>
                <button className="delete-btn" onClick={() => denyAll(selectedGroup.items)}>Deny & Delete All</button>
                <button className="close-btn" onClick={() => setSelectedGroup(null)}>&times;</button>
              </div>
            </div>

            <div className="review-grid">
              {selectedGroup.items.map(photo => (
                <div key={photo.id} className={`review-card ${photo.approved ? 'is-approved' : ''}`}>
                  {/* Thumbnail Click opens Lightbox */}
                  <div className="review-thumbnail" onClick={() => setReviewLightbox(photo)} style={{cursor: 'pointer'}}>
                    {isVideoFile(photo.image_url, photo.file_type) ? (
                      <video src={photo.image_url} preload="auto" muted loop autoPlay /> // Fix: Native playback support
                    ) : (
                      <img src={photo.image_url} alt="Uploaded by guest" />
                    )}
                    <div className="expand-overlay">🔍 Click to enlarge</div>
                  </div>
                  <div className="card-actions">
                    <button 
                      className={photo.approved ? "btn-secondary" : "approve-btn"}
                      onClick={() => toggleApproval(photo.id, photo.approved)}
                    >
                      {photo.approved ? "Unapprove" : "Approve"}
                    </button>
                    <button className="delete-btn" onClick={() => deletePhoto(photo.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {selectedGroup.items.length === 0 && <p>All items deleted.</p>}
            </div>
          </div>
        </div>
      )}

      {/* FIX: New Admin Lightbox */}
      {reviewLightbox && (
         <div className="lightbox-overlay" style={{ zIndex: 1100 }}>
         <button className="close-btn" onClick={() => setReviewLightbox(null)}>&times;</button>
         
         <div className="lightbox-content">
           {isVideoFile(reviewLightbox.image_url, reviewLightbox.file_type) ? (
             <video src={reviewLightbox.image_url} controls autoPlay playsInline />
           ) : (
              <img src={reviewLightbox.image_url} alt="Full size review" />
           )}
           
           <div className="lightbox-controls">
             <p>File from: {reviewLightbox.guest_name}</p>
             <div className="lightbox-actions">
                <button 
                   className={reviewLightbox.approved ? "btn-secondary" : "approve-btn"}
                   onClick={() => toggleApproval(reviewLightbox.id, reviewLightbox.approved)}
                 >
                   {reviewLightbox.approved ? "Unapprove" : "Approve"}
                 </button>
                 <button className="delete-btn" onClick={() => deletePhoto(reviewLightbox.id)}>
                   Delete
                 </button>
             </div>
           </div>
         </div>
       </div>
      )}
    </div>
  );
}