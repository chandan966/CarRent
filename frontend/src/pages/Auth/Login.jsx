import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Car,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must contain at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Temporary login until backend authentication is connected
    setTimeout(() => {
      login({
        email: formData.email,
      });

      setIsLoading(false);
      navigate("/");
    }, 700);
  };

  const handleGoogleLogin = () => {
    // Google authentication will be connected later
    console.log("Google login clicked");
  };

  return (
    <div className="login-page">
      {/* LEFT SIDE */}
      <section className="login-background">
        <div className="background-shape shape-one"></div>
        <div className="background-shape shape-two"></div>
        <div className="background-grid"></div>
        <div className="login-overlay"></div>

        {/* Brand */}
        <div className="login-brand">
          <div className="brand-icon">
            <Car size={25} strokeWidth={2.3} />
          </div>

          <div className="brand-content">
            <h1>CarRent</h1>
            <p>Drive your journey</p>
          </div>
        </div>

        {/* Hero */}
        <div className="login-hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            PREMIUM CAR MARKETPLACE
          </div>

          <h2>
            Find your perfect car.
            <br />
            <span>Start your journey.</span>
          </h2>

          <p>
            Rent, buy or sell cars through a smarter,
            safer and more seamless automotive experience.
          </p>

          <div className="hero-features">
            <div className="hero-feature">
              <ShieldCheck size={18} />
              <span>Secure & Trusted</span>
            </div>

            <div className="hero-feature">
              <Car size={18} />
              <span>Premium Vehicles</span>
            </div>
          </div>
        </div>

        <div className="hero-bottom-text">
          Your road. Your choice. Your journey.
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="login-container">
        <div className="login-card">

          {/* Mobile Brand */}
          <div className="mobile-brand">
            <div className="brand-icon">
              <Car size={23} />
            </div>

            <h1>CarRent</h1>
          </div>

          {/* Header */}
          <div className="login-header">
            <span className="welcome-label">
              WELCOME BACK
            </span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your details below to continue your journey.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

              <div
                className={`input-wrapper ${
                  errors.email ? "input-error" : ""
                }`}
              >
                <Mail size={19} />

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
                <span className="error-message">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div
                className={`input-wrapper ${
                  errors.password ? "input-error" : ""
                }`}
              >
                <Lock size={19} />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
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
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {errors.password && (
                <span className="error-message">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember */}
            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />

                <span className="custom-checkbox"></span>

                <span>Remember me</span>
              </label>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              className={`login-button ${
                isLoading ? "loading" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="button-loader"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>OR CONTINUE WITH</span>
          </div>

          {/* Google */}
          <button
            type="button"
            className="google-button"
            onClick={handleGoogleLogin}
          >
            <span className="google-icon">G</span>
            <span>Continue with Google</span>
          </button>

          {/* Signup */}
          <p className="signup-text">
            Don't have an account?{" "}
            <Link to="/signup">
              Create an account
              <ArrowRight size={14} />
            </Link>
          </p>

          {/* Security */}
          <div className="security-note">
            <ShieldCheck size={15} />
            <span>
              Your information is protected and secure.
            </span>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Login;