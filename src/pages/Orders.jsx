import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../layouts/Sidebar";
import "./Orders.css";

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    // FIX: Using user.name instead of user.uid to match your current database structure
    if (!user?.name) return;

    const q = query(collection(db, "orders"), where("artistId", "==", user.name));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const filteredOrders = filter === "All" 
    ? orders 
    : orders.filter((o) => o.status === filter);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <header className="orders-header">
          <h1>Orders</h1>
          <div className="filter-tabs">
            {["All", "Completed", "Pending", "In Escrow"].map((f) => (
              <button 
                key={f} 
                className={filter === f ? "active" : ""} 
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : (
          <div className="dash-card">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Artwork</th>
                  <th>Buyer Name</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.artworkTitle}</td>
                    <td>{order.buyerName}</td>
                    <td className="order-amount">${Number(order.amount || 0).toLocaleString()}</td>
                    <td>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`status-select status-${order.status?.toLowerCase().replace(' ', '-')}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Escrow">In Escrow</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;