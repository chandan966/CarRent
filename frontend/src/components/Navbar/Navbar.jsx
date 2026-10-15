import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CarFront,
  Heart,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import "./Navbar.css";

const navigation = [
  { label: "Home", to: "/", end: true },
  { label: "Buy", to: "/buy" },
  { label: "Rent", to: "/rent" },
  { label: "Sell", to: "/sell" },
  { label: "Services", to: "/services" },
  { label: "Cars", to: "/cars" },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchLocationKey, setSearchLocationKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuLocationKey, setMenuLocationKey] = useState(null);
  const searchOpen = searchLocationKey === location.key;
  const menuOpen = menuLocationKey === location.key;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuLocationKey(null);
        setSearchLocationKey(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closePanels = () => {
    setMenuLocationKey(null);
    setSearchLocationKey(null);
  };

  const handleBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/");
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/cars?search=${encodeURIComponent(query)}` : "/cars");
    closePanels();
  };

  const linkClass = ({ isActive }) => `navbar-link${isActive ? " active" : ""}`;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button
          className="navbar-back-button"
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>

        <Link to="/" className="navbar-logo" onClick={closePanels} aria-label="CarRent home">
          <span className="navbar-logo-icon"><CarFront size={21} aria-hidden="true" /></span>
          <span className="navbar-logo-copy">
            <strong>CarRent</strong>
            <span>Drive your journey</span>
          </span>
        </Link>

        <nav
          className={`navbar-links${menuOpen ? " active" : ""}`}
          id="site-navigation"
          aria-label="Main navigation"
        >
          {navigation.map(({ label, to, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={closePanels}>
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin/dashboard" className={linkClass} onClick={closePanels}>
              Admin
            </NavLink>
          )}
          <NavLink
            to={user ? "/profile" : "/login"}
            className={(state) => `${linkClass(state)} navbar-account-link`}
            onClick={closePanels}
          >
            {user ? "My Profile" : "Log in"}
          </NavLink>
        </nav>

        <div className="navbar-actions">
          <button
            className={`navbar-icon-button${searchOpen ? " selected" : ""}`}
            type="button"
            onClick={() => {
              setSearchLocationKey(searchOpen ? null : location.key);
              setMenuLocationKey(null);
            }}
            aria-label={searchOpen ? "Close search" : "Search cars"}
            aria-expanded={searchOpen}
            aria-controls="navbar-search-panel"
            title="Search cars"
          >
            {searchOpen ? <X size={19} aria-hidden="true" /> : <Search size={19} aria-hidden="true" />}
          </button>

          <button
            className="navbar-icon-button"
            type="button"
            onClick={() => navigate("/favorites")}
            aria-label="Favorites"
            title="Favorites"
          >
            <Heart size={19} aria-hidden="true" />
          </button>

          <button
            className="navbar-icon-button"
            type="button"
            onClick={() => navigate("/notifications")}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={19} aria-hidden="true" />
          </button>

          <button
            className="navbar-profile"
            type="button"
          onClick={() => navigate(user ? "/profile" : "/login")}
          aria-label={user?.fullName ? `Open ${user.fullName}'s profile` : "Log in"}
            title="Profile"
          >
            <span className="profile-avatar"><User size={17} aria-hidden="true" /></span>
            <span className="navbar-profile-name">{user?.fullName?.split(" ")[0] || "Log in"}</span>
          </button>

          <button
            className="navbar-menu-button"
            type="button"
            onClick={() => {
              setMenuLocationKey(menuOpen ? null : location.key);
              setSearchLocationKey(null);
            }}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
          >
            {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="navbar-search" id="navbar-search-panel">
          <form className="navbar-search-box" role="search" onSubmit={handleSearch}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search cars, brands or models"
              aria-label="Search cars, brands or models"
              autoFocus
            />
            {searchQuery && (
              <button type="button" className="navbar-search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search">
                <X size={17} aria-hidden="true" />
              </button>
            )}
            <button className="navbar-search-submit" type="submit">Search</button>
          </form>
        </div>
      )}
    </header>
  );
}

export default Navbar;
