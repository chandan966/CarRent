import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send, Car } from "lucide-react";
import "./Forgotpassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setMessage("Password reset email is not configured yet. Please contact the site administrator for help.");
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">

        <div className="forgot-logo">
          <div className="forgot-logo-icon">
            <Car size={24} />
          </div>
          <span>CarRent</span>
        </div>

        <div className="forgot-icon">
          <Mail size={30} />
        </div>

        <h1>Forgot Password?</h1>

        <p className="forgot-description">
          Enter your registered email address. Password reset is not available until an email provider is connected.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>

          <div className="forgot-input">
            <Mail size={18} />

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <p className="forgot-error">{error}</p>}

          {message && <p className="forgot-success">{message}</p>}

          <button type="submit" className="reset-button">
            <Send size={18} />
            Check Reset Availability
          </button>
        </form>

        <Link to="/login" className="back-login">
          <ArrowLeft size={17} />
          Back to Login
        </Link>

      </div>
    </div>
  );
}

export default ForgotPassword;
