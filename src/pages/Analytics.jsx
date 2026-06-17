import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../layouts/Sidebar";
import "./Analytics.css";

const Analytics = () => {
  const { user } = useAuth(); // Assuming this object contains 'name'
  const [stats, setStats] = useState({ revenue: 0, sold: 0 });

  // In your Analytics.js
useEffect(() => {
  if (!user?.name) return; // Ensure we have the name

  // Query orders where artistId matches the current user's name
  const q = query(collection(db, "orders"), where("artistId", "==", user.name));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    let totalRevenue = 0;
    let totalSold = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      // Only include orders marked as "Completed"
      if (data.status === "Completed") {
        totalSold += 1;
        totalRevenue += Number(data.amount || 0);
      }
    });

    setStats({ revenue: totalRevenue, sold: totalSold });
  });

  return () => unsubscribe();
}, [user]);
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="analytics-page">
        <h1>Performance Overview</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.revenue.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.sold}</p>
          </div>
          <div className="stat-card">
            <h3>Avg. Order Value</h3>
            <p className="stat-value">
              {stats.sold > 0 ? `$${(stats.revenue / stats.sold).toFixed(2)}` : "$0.00"}
            </p>
          </div>
        </div>

        <div className="chart-section dash-card" style={{ marginTop: '2rem' }}>
          <h3>Monthly Growth Trend</h3>
          <p style={{ color: '#777' }}>Integration for Recharts or Chart.js coming soon...</p>
        </div>
      </main>
    </div>
  );
};

export default Analytics;