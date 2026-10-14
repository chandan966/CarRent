import { useState } from "react";

import { useAuth } from "../../context/useAuth";

import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Car,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import "./Signup.css";

const googleAuthErrors = {
  google_not_configured: "Google sign-in is not configured yet. Add the Google OAuth settings to .env.local.",
  google_config_invalid: "The Google callback URL is not configured correctly.",
  google_cancelled: "Google sign-in was cancelled. You can try again.",
  google_invalid_state: "This sign-in request expired or could not be verified. Please try again.",
  google_email_unverified: "Google sign-in requires a verified Google email address.",
  google_account_conflict: "This account is already linked to a different Google account. Sign in with your existing method.",
  google_failed: "Google sign-in could not be completed. Please try again.",
};

const Signup = () => {
  const navigate = useNavigate();

  const { signup } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(() => {
    const code = new URLSearchParams(window.location.search).get("oauthError");
    return googleAuthErrors[code] || "";
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Enter your full name";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 12) {
      newErrors.password =
        "Use at least 12 characters for a stronger password";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.terms) {
      newErrors.terms = "Please confirm account creation";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");
    try {
      await signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });
      navigate("/");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* LEFT SIDE */}
      <section className="signup-background">
        <div className="signup-background-shape signup-shape-one"></div>
        <div className="signup-background-shape signup-shape-two"></div>
        <div className="signup-background-grid"></div>
        <div className="signup-overlay"></div>

        <div className="signup-brand">
          <div className="signup-brand-icon">
            <Car size={25} strokeWidth={2.3} />
          </div>

          <div className="signup-brand-content">
            <h1>CarRent</h1>
            <p>Drive your journey</p>
          </div>
        </div>

        <div className="signup-hero-content">
          <div className="signup-hero-badge">
            <span></span>
            PREMIUM CAR MARKETPLACE
          </div>

          <h2>
            Your journey
            <br />
            <span>starts here.</span>
          </h2>

          <p>
            Create your account and unlock a smarter way to
            rent, buy and sell cars.
          </p>

          <div className="signup-features">
            <div className="signup-feature">
              <ShieldCheck size={18} />
              <span>Server-side Sessions</span>
            </div>

            <div className="signup-feature">
              <Car size={18} />
              <span>Premium Vehicles</span>
            </div>
          </div>
        </div>

        <div className="signup-bottom-text">
          One account. Every automotive journey.
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="signup-container">
        <div className="signup-card">
          <div className="signup-mobile-brand">
            <div className="signup-brand-icon">
              <Car size={23} />
            </div>

            <h1>CarRent</h1>
          </div>

          <div className="signup-header">
            <span className="signup-welcome-label">
              GET STARTED
            </span>

            <h2>Create your account</h2>

            <p>
              Join CarRent and start your automotive journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            {/* Full Name */}
            <div className="signup-form-group">
              <label htmlFor="fullName">Full name</label>

              <div
                className={`signup-input-wrapper ${
                  errors.fullName ? "signup-input-error" : ""
                }`}
              >
                <User size={18} />

                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>

              {errors.fullName && (
                <span className="signup-error-message">
                  {errors.fullName}
                </span>
              )}
            </div>

            {/* Email + Phone */}
            <div className="signup-row">
              <div className="signup-form-group">
                <label htmlFor="email">Email address</label>

                <div
                  className={`signup-input-wrapper ${
                    errors.email ? "signup-input-error" : ""
                  }`}
                >
                  <Mail size={18} />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>

                {errors.email && (
                  <span className="signup-error-message">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="signup-form-group">
                <label htmlFor="phone">Phone number</label>

                <div
                  className={`signup-input-wrapper ${
                    errors.phone ? "signup-input-error" : ""
                  }`}
                >
                  <Phone size={18} />

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    maxLength="10"
                  />
                </div>

                {errors.phone && (
                  <span className="signup-error-message">
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="signup-form-group">
              <label htmlFor="password">Password</label>

              <div
                className={`signup-input-wrapper ${
                  errors.password ? "signup-input-error" : ""
                }`}
              >
                <Lock size={18} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  minLength={12}
                  maxLength={128}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <span className="signup-error-message">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="signup-form-group">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div
                className={`signup-input-wrapper ${
                  errors.confirmPassword
                    ? "signup-input-error"
                    : ""
                }`}
              >
                <Lock size={18} />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <span className="signup-error-message">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Terms */}
            <div className="signup-terms-section">
              <label className="signup-terms">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                />

                <span className="signup-custom-checkbox"></span>

                <span>
                  I agree to create a CarRent account and understand that the service stores my account and booking details.
                </span>
              </label>

              {errors.terms && (
                <span className="signup-error-message">
                  {errors.terms}
                </span>
              )}
            </div>

            {/* Create Account */}
            <button
              type="submit"
              className={`signup-button ${
                isLoading ? "signup-loading" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="signup-button-loader"></span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="signup-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          {/* Google */}
          <button
            type="button"
            className="signup-google-button"
            disabled={isLoading}
            onClick={() => window.location.assign("/api/auth/google?screen=signup")}
          >
            <span className="signup-google-icon">G</span>
            <span>Continue with Google</span>
          </button>

          {apiError && <p className="signup-error-message" role="alert">{apiError}</p>}

          <p className="signup-login-text">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
              <ArrowRight size={14} />
            </Link>
          </p>

          <div className="signup-security-note">
            <ShieldCheck size={15} />
            <span>
              Passwords are stored as salted, one-way hashes.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Signup;
