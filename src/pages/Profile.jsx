import { useEffect, useState, useRef } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({ name: "", bio: "", avatarURL: "", website: "", location: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) setProfile((prev) => ({ ...prev, ...doc.data() }));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSaving(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (data.secure_url) {
        await updateDoc(doc(db, "users", user.uid), { avatarURL: data.secure_url });
      }
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: profile.name,
        bio: profile.bio,
        website: profile.website,
        location: profile.location,
        avatarURL: profile.avatarURL
      });
      setIsEditing(false);
    } catch (err) {
      alert("Error updating profile");
    }
    setSaving(false);
  };

  if (loading) return <div className="loading-state">Loading profile...</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar-container" onClick={isEditing ? () => fileInputRef.current.click() : undefined}>
          {profile.avatarURL ? (
            <img src={profile.avatarURL} alt="Profile" className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">{profile.name?.charAt(0)?.toUpperCase() || "U"}</div>
          )}
          {isEditing && <input type="file" ref={fileInputRef} onChange={handleImageChange} hidden accept="image/*" />}
        </div>
        
        <div className="profile-info">
          <h1>{profile.name || "Artist Name"}</h1>
          <p className="bio-text">{profile.bio || "No bio yet."}</p>
          <button onClick={() => setIsEditing(!isEditing)} className="edit-toggle-btn">
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {isEditing && (
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Display Name</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea rows="3" value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})}></textarea>
          </div>
          <div className="form-group">
            <label>Website</label>
            <input type="url" value={profile.website} onChange={(e) => setProfile({...profile, website: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
};
export default Profile;