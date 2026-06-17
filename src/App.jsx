import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Import your components
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArtistDashboard from "./pages/ArtistDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Orders from "./pages/Orders";
import Gallery from "./pages/Gallery";
import ArtworkDetail from "./pages/ArtworkDetail";
import Analytics from "./pages/Analytics"; 
import Profile from "./pages/Profile";     
import Settings from "./pages/Settings"; 
import ArtDetail from "./pages/ArtDetail"; 
import Checkout from "./pages/Checkout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Accessible to everyone */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        
        {/* Public Detail Page (Moved out of ProtectedRoute/Artist layout) */}
        <Route path="/art/:id" element={<ArtDetail />} />

        {/* Protected Artist Routes */}
        <Route
          path="/artist"
          element={
            <ProtectedRoute role="artist">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ArtistDashboard />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="orders" element={<Orders />} />
          <Route path="sales" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          
        </Route>

        {/* Protected Customer Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute role="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;