import { Link } from "react-router-dom";
import { FiSearch, FiHeart, FiUser, FiShoppingBag } from "react-icons/fi";
// 1. Import your image file
import logo from "../assets/logo.png"; 
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* 2. Update the Logo Link to use an img tag */}
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Artera Logo" className="logo-img" />
          <h2>ARTERA</h2>
      </Link>


      {/* Search Bar */}
      <div className="navbar-search">
        <FiSearch className="search-icon" />
        <input type="text" placeholder="Search art, artists, styles..." />
      </div>

      {/* Nav Links */}
      <div className="navbar-links">
        <Link to="/register?role=artist" className="nav-link">
          Sell Art
        </Link>
        <Link to="/login" className="nav-link">
          <FiHeart />
        </Link>
        <Link to="/login" className="nav-link">
          <FiShoppingBag />
        </Link>
        <Link to="/login" className="nav-link nav-avatar">
          <FiUser />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;