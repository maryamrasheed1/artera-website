import { useState, useEffect } from "react";
import { updatePassword, deleteUser } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Settings.css";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    orderAlerts: true,
    marketing: false,
  });

  // Load existing preferences on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists() && userDoc.data().notifications) {
        setNotifications(userDoc.data().notifications);
      }
    };
    fetchSettings();
  }, []);

  // Update Password Handler
  const handleUpdatePassword = async () => {
    const newPassword = prompt("Enter your new password:");
    if (!newPassword) return;

    setLoading(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      alert("Password updated successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure? This action is permanent.");
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      alert("Account deleted successfully.");
    } catch (error) {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  // Toggle Notification Handler
  const toggleNotification = async (key) => {
    const newValue = !notifications[key];
    const newSettings = { ...notifications, [key]: newValue };
    
    setNotifications(newSettings);
    
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        notifications: newSettings
      });
    } catch (err) {
      alert("Failed to save preference.");
    }
  };

  return (
    <div className="settings-page">
      <h1>Account Settings</h1>

      <div className="settings-card">
        <h3>Security</h3>
        <p>Manage your account credentials and security preferences.</p>
        <button className="btn-secondary" onClick={handleUpdatePassword} disabled={loading}>
          {loading ? "Processing..." : "Update Password"}
        </button>
        <button className="btn-danger" onClick={handleDeleteAccount} disabled={loading}>
          {loading ? "Processing..." : "Delete Account"}
        </button>
      </div>

      <div className="settings-card">
        <h3>Notifications</h3>
        <p>Choose what updates you want to receive.</p>
        <div className="toggle-list">
          {Object.keys(notifications).map((key) => (
            <div key={key} className="toggle-item">
              <span>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notifications[key]} 
                  onChange={() => toggleNotification(key)} 
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;