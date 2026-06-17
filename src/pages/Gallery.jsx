import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Sidebar from "../layouts/Sidebar";
import UploadModal from "../components/ui/UploadModal";
import { useAuth } from "../context/AuthContext";
import { getArtistArtworks, deleteArtwork } from "../services/artworkService";

import { db } from "../firebase";

import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import {
  FiPlus, FiSettings, FiX, FiMapPin,
  FiCamera, FiGrid, FiHeart, FiEye, FiTrash2
} from "react-icons/fi";
import "./Gallery.css";



const EditProfileModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    avatarURL: user?.avatarURL || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // New state to track upload progress
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true); // Disable Save button while uploading
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      
      // Update form state with the new URL
      setForm((prev) => ({ ...prev, avatarURL: data.secure_url }));
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false); // Re-enable Save button
    }
  };

 const handleSave = async () => {
  if (uploading) return;
  setSaving(true);
  try {
    // Ensure 'form' contains name, bio, location, website, AND photoURL
    await updateDoc(doc(db, "users", user.uid), form); 
    onSave(form); 
    onClose();
  } catch (err) {
    console.error("Save failed:", err);
  } finally {
    setSaving(false);
  }
};

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2>Edit Profile</h2>
          <button onClick={onClose}><FiX /></button>
        </div>
        <div className="edit-modal-body">
          <div className="edit-avatar-section">
            <div className="edit-avatar" onClick={() => fileInputRef.current.click()}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                style={{ display: "none" }}
                accept="image/*"
              />
              {/* Show loading state or image */}
              {uploading ? (
                <div className="upload-spinner">...</div>
              ) : form.avatarURL ? (
                <img src={form.avatarURL} alt="Avatar" />
              ) : (
                form.name?.charAt(0).toUpperCase()
              )}
              <div className="edit-avatar-overlay">
                <FiCamera />
              </div>
            </div>
            <p>{uploading ? "Uploading..." : "Change photo"}</p>
          </div>
          {/* ... rest of the input fields map (stays same) ... */}
          {[
            { label: "Name", key: "name" },
            { label: "Bio", key: "bio", textarea: true },
            { label: "Location", key: "location" },
            { label: "Website", key: "website" },
          ].map(({ label, key, textarea }) => (
            <div className="edit-field" key={key}>
              <label>{label}</label>
              {textarea ? (
                <textarea
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              ) : (
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
        <div className="edit-modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="btn-save" 
            onClick={handleSave} 
            disabled={saving || uploading} // Disable while saving OR uploading
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Gallery = () => {
  const { user, login } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [localUser, setLocalUser] = useState(user);

  const fetchArtworks = async () => {
    if (!user) return;
    try {
      const data = await getArtistArtworks(user.uid);
      setArtworks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArtworks(); }, [user]);
  useEffect(() => { setLocalUser(user); }, [user]);

  // Inside Gallery Component
useEffect(() => {
  if (!user?.uid) return;
  
  // 1. Fetch Artworks
  fetchArtworks();

  // 2. Real-time listener for User Profile
  const unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (doc) => {
    if (doc.exists()) {
      setLocalUser({ id: doc.id, ...doc.data() });
    }
  });

  return () => unsubscribeUser();
}, [user]);

// Simplified handleProfileSave - no need to call 'login' manually
const handleProfileSave = (updatedFields) => {
  setLocalUser((prev) => ({ ...prev, ...updatedFields }));
};

  const handleDelete = async (art) => {
    if (!window.confirm(`Delete "${art.title}"?`)) return;
    try {
      await deleteArtwork(art.id);
      setArtworks((prev) => prev.filter((a) => a.id !== art.id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === "All" ? artworks : artworks.filter((a) => a.status === filter);
  const totalViews = artworks.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalSaves = artworks.reduce((sum, a) => sum + (a.saves || 0), 0);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="gallery-main">
        <div className="profile-header">
          <div className="profile-header-inner">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar-circle">
                {localUser?.avatarURL ? (
                  <img src={localUser.avatarURL} alt="Avatar" />
                ) : (
                  localUser?.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div className="profile-info">
              <div className="profile-name-row">
                <h1>{localUser?.name}</h1>
                <button className="profile-edit-btn" onClick={() => setShowEditProfile(true)}>
                  <FiSettings /> Edit Profile
                </button>
                <button className="upload-btn-sm" onClick={() => setShowUpload(true)}>
                  <FiPlus /> New Post
                </button>
              </div>
              <div className="profile-stats-row">
                <div className="profile-stat"><strong>{artworks.length}</strong> <span>posts</span></div>
                <div className="profile-stat"><strong>{totalViews}</strong> <span>views</span></div>
                <div className="profile-stat"><strong>{totalSaves}</strong> <span>saves</span></div>
              </div>
              <div className="profile-bio">
                <p className="bio-role">🎨 Independent Artist</p>
                {localUser?.bio && <p className="bio-text">{localUser.bio}</p>}
                {localUser?.location && <p className="bio-location"><FiMapPin size={12} /> {localUser.location}</p>}
                {localUser?.website && (
                  <a className="bio-website" href={localUser.website} target="_blank" rel="noreferrer">
                    {localUser.website}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="profile-tabs">
            {["All", "Listed", "Sold", "Hidden"].map((f) => (
              <button key={f} className={`profile-tab ${filter === f ? "tab-active" : ""}`} onClick={() => setFilter(f)}>
                {f === "All" && <FiGrid size={13} />} {f}
              </button>
            ))}
          </div>
        </div>

        <div className="posts-section">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Loading your gallery...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-posts">
              <div className="empty-icon"><FiPlus /></div>
              <h3>No posts yet</h3>
              <p>Share your first artwork with the world</p>
              <button className="upload-btn" onClick={() => setShowUpload(true)}>
                <FiPlus /> Upload Artwork
              </button>
            </div>
          ) : (
            <div className="posts-grid">
              {filtered.map((art, i) => (
                <div key={i} className="post-card">
                  <img src={art.imageURL} alt={art.title} />
                  <div className="post-overlay">
                    <div className="post-overlay-stats">
                      <span><FiHeart /> {art.saves || 0}</span>
                      <span><FiEye /> {art.views || 0}</span>
                    </div>
                    <div className="post-overlay-actions">
                      <button title="Delete" onClick={() => handleDelete(art)}><FiTrash2 /></button>
                    </div>
                  </div>
                  <span className={`post-status status-${art.status?.toLowerCase()}`}>{art.status}</span>
                  <div className="post-info">
                    <p className="post-title">{art.title}</p>
                    <p className="post-price">{art.price ? `PKR ${Number(art.price).toLocaleString()}` : "Not listed"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={fetchArtworks} />}
        {showEditProfile && (
          <EditProfileModal user={localUser} onClose={() => setShowEditProfile(false)} onSave={handleProfileSave} />
        )}
      </main>
    </div>
  );
};

export default Gallery;