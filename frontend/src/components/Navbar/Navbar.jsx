import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  Bell,
  User,
  CarFront,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* LOGO */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <CarFront size={21} />
          </div>

          <div>
            <strong>CarRent</strong>
            <span>Drive your journey</span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <Link to="/">Home</Link>
          <Link to="/buy">Buy</Link>
          <Link to="/rent">Rent</Link>
          <Link to="/sell">Sell</Link>
          <Link to="/services">Services</Link>
          <Link to="/cars">Cars</Link>
        </nav>

        {/* ACTIONS */}
        <div className="navbar-actions">

          <button
            className="navbar-icon-button"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <Search size={19} />
          </button>

          <button
            className="navbar-icon-button"
            onClick={() => navigate("/favorites")}
            aria-label="Favorites"
          >
            <Heart size={19} />
          </button>

          <button
            className="navbar-icon-button"
            onClick={() => navigate("/notifications")}
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="notification-dot"></span>
          </button>

          <button
            className="navbar-profile"
            onClick={() => navigate("/profile")}
          >
            <div className="profile-avatar">
              <User size={17} />
            </div>

            <span>
              {user?.fullName
                ? user.fullName.split(" ")[0]
                : "Profile"}
            </span>
          </button>

          <button
            className="navbar-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>
      </div>

      {/* SEARCH */}
      {searchOpen && (
        <div className="navbar-search">
          <div className="navbar-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search cars, brands or models..."
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;