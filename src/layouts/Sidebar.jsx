import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiGrid, FiImage, FiShoppingBag,
  FiBarChart2, FiSettings, FiLogOut,
  FiUser, FiExternalLink
} from "react-icons/fi";
import "./Sidebar.css";
import logo1 from "../assets/logo1.png";

const navItems = [
  { icon: <FiGrid />, label: "Overview", path: "/artist/dashboard" },
  { icon: <FiImage />, label: "My Gallery", path: "/artist/gallery" },
  { icon: <FiShoppingBag />, label: "Orders", path: "/artist/orders" },
  { icon: <FiBarChart2 />, label: "Analytics", path: "/artist/sales" },
  { icon: <FiUser />, label: "Profile", path: "/artist/profile" },
  { icon: <FiSettings />, label: "Settings", path: "/artist/settings" },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-logo">
        <img src={logo1} alt="Artera Logo" className="logo-image" />
      </Link>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
  to={item.path} 
  key={item.label}
  className={({ isActive }) => 
    isActive ? "sidebar-link sidebar-active" : "sidebar-link"
  }
>
  {item.icon}
  <span>{item.label}</span>
</NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <Link to="/" className="sidebar-link sidebar-view-site">
          <FiExternalLink />
          <span>View Site</span>
        </Link>
        <button className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;