import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase"; 
import UploadModal from "../components/ui/UploadModal";
import Sidebar from "../layouts/Sidebar";
import { useAuth } from "../context/AuthContext";
import { FiTrendingUp, FiShoppingBag, FiHeart, FiEye, FiPlus, FiMoreVertical } from "react-icons/fi";
import "./ArtistDashboard.css";

const statusColor = { Completed: "#2f4a3e", "In Escrow": "#b84b2a", Pending: "#999" };

const ArtistDashboard = () => {
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [artworks, setArtworks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({ name: "", profileImageURL: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !user?.name) return;

    // 1. Fetch Profile Real-time
    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) setProfile(doc.data());
    });

    // 2. Fetch Artworks (Querying by artistId - ensure this matches your DB)
    const artQuery = query(collection(db, "artworks"), where("artistId", "==", user.uid));
    const unsubArtworks = onSnapshot(artQuery, (snapshot) => {
      setArtworks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // 3. Fetch Orders (CRITICAL FIX: Querying by name per your DB screenshot)
    const orderQuery = query(collection(db, "orders"), where("artistId", "==", user.name));
    const unsubOrders = onSnapshot(orderQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubProfile();
      unsubArtworks();
      unsubOrders();
    };
  }, [user]);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status === "Completed" ? Number(o.amount || 0) : 0), 0);
  
  const stats = [
    { icon: <FiTrendingUp />, label: "Total Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, change: "Lifetime earnings", color: "#b84b2a" },
    { icon: <FiShoppingBag />, label: "Orders", value: orders.length.toString(), change: "Total orders received", color: "#2f4a3e" },
    { icon: <FiHeart />, label: "Saves", value: "0", change: "Feature coming soon", color: "#b84b2a" },
    { icon: <FiEye />, label: "Artworks", value: artworks.length.toString(), change: "Total uploaded", color: "#2f4a3e" },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="user-profile-header">
            {profile.avatarURL && (
              <img src={profile.avatarURL} alt="Profile" className="profile-thumb" />
            )}
            <div>
              <h1>Good morning, {profile.name || user?.name} ✦</h1>
              <p>Here's what's happening with your art today.</p>
            </div>
          </div>
          <button className="upload-btn" onClick={() => setShowUpload(true)}>
            <FiPlus /> Upload Artwork
          </button>
        </div>

        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: s.color + "18", color: s.color }}>{s.icon}</div>
              <div>
                <p className="stat-label">{s.label}</p>
                <h3 className="stat-value">{s.value}</h3>
                <p className="stat-change">{s.change}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-columns">
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>My Artworks</h2>
              <a href="/artist/gallery" className="see-all">See all</a>
            </div>
            {loading ? <p style={{ padding: "1rem" }}>Loading...</p> : 
            artworks.length === 0 ? <p style={{ padding: "1rem" }}>No artworks yet.</p> :
            <div className="artwork-list">
                {artworks.slice(0, 4).map((art, i) => (
                  <div key={i} className="artwork-row">
                    <img src={art.imageURL} alt={art.title} className="artwork-thumb" />
                    <div className="artwork-row-info">
                      <p className="artwork-row-title">{art.title}</p>
                      <p className="artwork-row-cat">{art.category}</p>
                    </div>
                    <div className="artwork-row-right">
                      <p className="artwork-row-price">{art.price ? `PKR ${art.price.toLocaleString()}` : "Not listed"}</p>
                    </div>
                  </div>
                ))}
            </div>}
          </div>

          <div className="dash-card">
            <div className="dash-card-header"><h2>Recent Orders</h2></div>
            <table className="orders-table">
              <thead><tr><th>Order</th><th>Artwork</th><th>Buyer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {orders.length > 0 ? orders.map((o) => (
                  <tr key={o.id}>
                    <td className="order-id">#{o.id.slice(-5).toUpperCase()}</td>
                    <td>{o.artworkTitle}</td>
                    <td>{o.buyerName}</td>
                    <td className="order-amount">PKR {Number(o.amount).toLocaleString()}</td>
                    <td>
                      <span className="order-status" style={{ color: statusColor[o.status] }}>{o.status}</span>
                    </td>
                  </tr>
                )) : <tr><td colSpan="5" style={{textAlign: 'center', padding: '1rem'}}>No recent orders.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
};

export default ArtistDashboard;