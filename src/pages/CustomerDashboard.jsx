import { useState, useEffect, useRef } from "react";
import { doc, updateDoc, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../layouts/Navbar";
import { FiGrid, FiHeart, FiTruck, FiSettings, FiLogOut, FiMapPin, FiShoppingBag, FiClock, FiStar, FiMoreVertical } from "react-icons/fi";
import "./CustomerDashboard.css";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("purchases");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState({});
  const [orders, setOrders] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    // Real-time listener for profile
    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) setProfile(doc.data());
    });

    // Real-time listener for orders
    const qOrders = query(collection(db, "orders"), where("ordererId", "==", user.uid));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Real-time listener for saved/wishlist
    const unsubSaved = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) setSaved(doc.data().wishlist || []);
      setLoading(false);
    });

    return () => { unsubProfile(); unsubOrders(); unsubSaved(); };
  }, [user]);

const handleUploadPFP = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Provide immediate UI feedback
    console.log("File selected:", file.name);

    const formData = new FormData();
    formData.append("file", file);
    // Ensure these keys match your .env file exactly
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, 
        {
          method: "POST",
          body: formData
        }
      );
      
      const data = await res.json();
      
      if (data.secure_url) {
        console.log("Upload successful, URL:", data.secure_url);
        // Update Firestore with the URL from Cloudinary
        await updateDoc(doc(db, "users", user.uid), { 
          avatarURL: data.secure_url 
        });
        console.log("Firestore updated successfully.");
      } else {
        console.error("Cloudinary did not return a secure_url. Response:", data);
      }
    } catch (error) {
      console.error("Upload process failed:", error);
    }
  };
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "users", user.uid), { 
        name: profile.name, 
        location: profile.location,
        avatarURL: profile.avatarURL // Added avatarURL here
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="customer-page">
      <Navbar />
      <div className="customer-layout">
        <aside className="customer-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              {profile.avatarURL ? <img src={profile.avatarURL} alt="Profile" /> : profile.name?.charAt(0) || "A"}
            </div>
            <h3>{profile.name || "User"}</h3>
            <p>Art Collector</p>
            <p className="profile-location"><FiMapPin /> {profile.location || "Lahore, Pakistan"}</p>
            <div className="profile-stats">
              <div><strong>{orders.length}</strong><span>Bought</span></div>
              <div><strong>{saved.length}</strong><span>Saved</span></div>
              <div><strong>{profile.reviewsCount || 0}</strong><span>Reviews</span></div>
            </div>
            <button className="edit-profile-btn" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Close Editor" : "Edit Profile"}
            </button>
          </div>

          <div className="quick-links">
            <p className="ql-title">Quick Links</p>
            <a href="/"><FiGrid /> Browse Art</a>
            <a href="#"><FiHeart /> My Wishlist</a>
            <a href="#"><FiTruck /> Track Orders</a>
            <a href="#"><FiSettings /> Settings</a>
            <a href="/login" className="logout-link"><FiLogOut /> Log Out</a>
          </div>
        </aside>

        <main className="customer-main">
          {isEditing ? (
            <form className="edit-modal" onSubmit={handleUpdateProfile}>
              <h3>Edit Profile</h3>

              {/* Inside your Edit Modal or Sidebar */}
<div className="edit-pfp-container">
  {/* The click handler here MUST reference the current input */}
  <div className="profile-avatar" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
    {profile.avatarURL ? (
      <img src={profile.avatarURL} alt="Profile" />
    ) : (
      profile.name?.charAt(0) || "A"
    )}
  </div>
  <p>Click to change photo</p>
  
  {/* The input must be connected to the ref and NOT hidden by display:none if some browsers block it */}
  <input 
    type="file" 
    ref={fileInputRef} 
    onChange={handleUploadPFP} 
    style={{ display: 'none' }} 
  />
</div>
              <input value={profile.name || ""} onChange={(e) => setProfile({...profile, name: e.target.value})} placeholder="Display Name" />
              <input value={profile.location || ""} onChange={(e) => setProfile({...profile, location: e.target.value})} placeholder="Location" />
              <button type="submit" className="save-btn">Confirm Changes</button>
            </form>
          ) : (
            <>
              <div className="customer-stats">
                {[
                  { icon: <FiShoppingBag />, label: "Total Purchases", value: orders.length, color: "#b84b2a" },
                  { icon: <FiHeart />, label: "Saved Artworks", value: saved.length, color: "#2f4a3e" },
                  { icon: <FiClock />, label: "Pending Orders", value: orders.filter(o => o.status === "Pending").length, color: "#b84b2a" },
                  { icon: <FiStar />, label: "Reviews Given", value: profile.reviewsCount || 0, color: "#2f4a3e" },
                ].map((s, i) => (
                  <div key={i} className="cust-stat-card">
                    <div className="cust-stat-icon" style={{ color: s.color, backgroundColor: s.color + "18" }}>{s.icon}</div>
                    <div><p className="cust-stat-label">{s.label}</p><h3 className="cust-stat-value">{s.value}</h3></div>
                  </div>
                ))}
              </div>
              <div className="customer-tabs">
                <button className={`ctab ${activeTab === "purchases" ? "ctab-active" : ""}`} onClick={() => setActiveTab("purchases")}>My Purchases</button>
                <button className={`ctab ${activeTab === "saved" ? "ctab-active" : ""}`} onClick={() => setActiveTab("saved")}>Saved Artworks</button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
export default CustomerDashboard;