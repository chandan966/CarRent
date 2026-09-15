
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Heart,
  ShoppingBag,
  KeyRound,
  Settings,
  LogOut,
  Camera,
  Pencil,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
  CarFront,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";

import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || ""
  );

  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "CarRent User",
    email: user?.email || "Not available",
    phone: user?.phone || "Not available",
    location: user?.location || "India",
  });

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageUrl = reader.result;

      setProfileImage(imageUrl);
      localStorage.setItem("profileImage", imageUrl);
    };

    reader.readAsDataURL(file);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setProfileData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      fullName: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone,
      location: profileData.location,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    setIsEditing(false);

    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const firstName =
    profileData.fullName?.split(" ")[0] || "User";

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <div className="profile-background-shape profile-shape-one"></div>
        <div className="profile-background-shape profile-shape-two"></div>

        <div className="profile-container">
          {/* PAGE HEADER */}
          <section className="profile-page-header">
            <div>
              <span className="profile-eyebrow">MY ACCOUNT</span>

              <h1>
                Welcome back, <span>{firstName}</span>
              </h1>

              <p>
                Manage your profile, bookings, favorites and account
                preferences from one place.
              </p>
            </div>

            <div className="profile-header-icon">
              <User size={28} />
            </div>
          </section>

          {/* PROFILE HERO */}
          <section className="profile-hero-card">
            <div className="profile-hero-glow"></div>

            <div className="profile-identity">
              <div className="profile-photo-wrapper">
                <div className="profile-photo">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                    />
                  ) : (
                    <User size={52} />
                  )}
                </div>

                <label
                  className="profile-camera-button"
                  htmlFor="profile-image-input"
                  title="Change profile photo"
                >
                  <Camera size={17} />
                </label>

                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </div>

              <div className="profile-identity-content">
                <div className="profile-name-row">
                  <h2>{profileData.fullName}</h2>

                  <span className="profile-verified">
                    <ShieldCheck size={15} />
                    Verified
                  </span>
                </div>

                <p className="profile-email">
                  <Mail size={16} />
                  {profileData.email}
                </p>

                <p className="profile-member">
                  <CalendarDays size={15} />
                  CarRent member
                </p>
              </div>
            </div>

            <button
              className="profile-edit-button"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil size={17} />
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </section>

          {/* STATS */}
          <section className="profile-stats">
            <button
              className="profile-stat-card"
              onClick={() => navigate("/favorites")}
            >
              <div className="profile-stat-icon favorite">
                <Heart size={21} />
              </div>

              <div>
                <strong>0</strong>
                <span>Favorites</span>
              </div>

              <ChevronRight size={18} />
            </button>

            <button
              className="profile-stat-card"
              onClick={() => navigate("/my-purchases")}
            >
              <div className="profile-stat-icon purchase">
                <ShoppingBag size={21} />
              </div>

              <div>
                <strong>0</strong>
                <span>Purchases</span>
              </div>

              <ChevronRight size={18} />
            </button>

            <button
              className="profile-stat-card"
              onClick={() => navigate("/my-rentals")}
            >
              <div className="profile-stat-icon rental">
                <KeyRound size={21} />
              </div>

              <div>
                <strong>0</strong>
                <span>Rentals</span>
              </div>

              <ChevronRight size={18} />
            </button>

            <div className="profile-stat-card profile-stat-static">
              <div className="profile-stat-icon cars">
                <CarFront size={21} />
              </div>

              <div>
                <strong>0</strong>
                <span>Bookings</span>
              </div>
            </div>
          </section>

          {/* MAIN CONTENT */}
          <div className="profile-content-grid">
            {/* PERSONAL INFORMATION */}
            <section className="profile-card personal-card">
              <div className="profile-card-heading">
                <div>
                  <span>ACCOUNT</span>
                  <h2>Personal Information</h2>
                </div>

                <div className="profile-heading-icon">
                  <User size={19} />
                </div>
              </div>

              {isEditing ? (
                <div className="profile-edit-form">
                  <div className="profile-input-group">
                    <label>Full Name</label>

                    <div className="profile-input">
                      <User size={17} />

                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="profile-input-group">
                    <label>Email Address</label>

                    <div className="profile-input">
                      <Mail size={17} />

                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="profile-input-group">
                    <label>Phone Number</label>

                    <div className="profile-input">
                      <Phone size={17} />

                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="profile-input-group">
                    <label>Location</label>

                    <div className="profile-input">
                      <MapPin size={17} />

                      <input
                        type="text"
                        name="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <button
                    className="profile-save-button"
                    onClick={handleSaveProfile}
                  >
                    <ShieldCheck size={18} />
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="profile-information-list">
                  <div className="profile-information-row">
                    <div className="profile-information-icon">
                      <User size={18} />
                    </div>

                    <div>
                      <span>Full Name</span>
                      <strong>{profileData.fullName}</strong>
                    </div>
                  </div>

                  <div className="profile-information-row">
                    <div className="profile-information-icon">
                      <Mail size={18} />
                    </div>

                    <div>
                      <span>Email Address</span>
                      <strong>{profileData.email}</strong>
                    </div>
                  </div>

                  <div className="profile-information-row">
                    <div className="profile-information-icon">
                      <Phone size={18} />
                    </div>

                    <div>
                      <span>Phone Number</span>
                      <strong>{profileData.phone}</strong>
                    </div>
                  </div>

                  <div className="profile-information-row">
                    <div className="profile-information-icon">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <span>Location</span>
                      <strong>{profileData.location}</strong>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* QUICK ACTIONS */}
            <section className="profile-card quick-actions-card">
              <div className="profile-card-heading">
                <div>
                  <span>QUICK ACCESS</span>
                  <h2>Manage Account</h2>
                </div>

                <div className="profile-heading-icon">
                  <Settings size={19} />
                </div>
              </div>

              <div className="profile-action-list">
                <button
                  className="profile-action-item"
                  onClick={() => navigate("/favorites")}
                >
                  <div className="profile-action-icon">
                    <Heart size={19} />
                  </div>

                  <div>
                    <strong>My Favorites</strong>
                    <span>View cars you saved</span>
                  </div>

                  <ChevronRight size={18} />
                </button>

                <button
                  className="profile-action-item"
                  onClick={() => navigate("/my-purchases")}
                >
                  <div className="profile-action-icon">
                    <ShoppingBag size={19} />
                  </div>

                  <div>
                    <strong>My Purchases</strong>
                    <span>View your purchased cars</span>
                  </div>

                  <ChevronRight size={18} />
                </button>

                <button
                  className="profile-action-item"
                  onClick={() => navigate("/my-rentals")}
                >
                  <div className="profile-action-icon">
                    <KeyRound size={19} />
                  </div>

                  <div>
                    <strong>My Rentals</strong>
                    <span>Manage your rental bookings</span>
                  </div>

                  <ChevronRight size={18} />
                </button>
              </div>
            </section>
          </div>

          {/* ACCOUNT STATUS */}
          <section className="profile-status-card">
            <div className="profile-status-icon">
              <ShieldCheck size={24} />
            </div>

            <div className="profile-status-content">
              <span>ACCOUNT STATUS</span>

              <h3>Your account is active</h3>

              <p>
                Your profile is ready to use. You can browse cars,
                save favorites and manage your bookings.
              </p>
            </div>

            <div className="profile-status-badge">
              Active
            </div>
          </section>

          {/* LOGOUT */}
          <section className="profile-logout-section">
            <button
              className="profile-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Logout
            </button>
          </section>
        </div>
      </main>
    </>
  );
}

export default Profile;