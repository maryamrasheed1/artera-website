import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/Sidebar"; // Adjust path if Sidebar is in components/

// src/layouts/DashboardLayout.jsx
const DashboardLayout = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );

};

export default DashboardLayout;