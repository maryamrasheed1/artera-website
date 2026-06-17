import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authService";
import { FiUser, FiFeather } from "react-icons/fi";
import logo1 from "../assets/logo1.png";
import "./Auth.css";

const Register = () => {
  const [role, setRole] = useState("customer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const navigate = useNavigate();
const { login } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  setLoading(true);
  try {
    const userData = await registerUser(
      formData.name,
      formData.email,
      formData.password,
      role
    );
    login(userData);
    navigate(role === "artist" ? "/artist/dashboard" : "/customer/dashboard");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <Link to="/" className="auth-logo">
    <img src={logo1} alt="Artera Logo" className="auth-logo-img" />
  </Link>

        <div className="auth-left-content">
          <h2>"Every artist was first<br />an amateur."</h2>
          <p> — Ralph Waldo Emerson</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-box">
          <h1>Create account</h1>
          <p className="auth-sub">Join the Artera community</p>

          {/* Role Selector */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${role === "customer" ? "role-active" : ""}`}
              onClick={() => setRole("customer")}
            >
              <FiUser />
              <span>Art Collector</span>
              <small>Browse & buy artwork</small>
            </button>
            <button
              type="button"
              className={`role-btn ${role === "artist" ? "role-active" : ""}`}
              onClick={() => setRole("artist")}
            >
              <FiFeather />
              <span>Artist</span>
              <small>Showcase & sell your work</small>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>{role === "artist" ? "Artist Name" : "Full Name"}</label>
              <input
                type="text"
                name="name"
                placeholder={role === "artist" ? "Your artist name" : "Your full name"}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label className="checkbox-label terms">
              <input type="checkbox" required />
              I agree to Artera's <a href="#">Terms & Privacy Policy</a>
            </label>
{error && <p className="auth-error">{error}</p>}

<button type="submit" className="auth-btn" disabled={loading}>
  {loading ? "Creating account..." : role === "artist" ? "Join as Artist" : "Join as Collector"}
</button>
           
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;