import { Link } from "react-router-dom";
import { CarFront } from "lucide-react";
import "./Footer.css";

const footerLinks = [
  { label: "Browse cars", to: "/cars" },
  { label: "Buy a car", to: "/buy" },
  { label: "Rent a car", to: "/rent" },
  { label: "Sell your car", to: "/sell" },
  { label: "Services", to: "/services" },
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo" aria-label="CarRent home">
            <span className="site-footer-logo-icon"><CarFront size={21} aria-hidden="true" /></span>
            <span>CarRent</span>
          </Link>
          <p>Find your next drive, book a rental, or list your car with confidence.</p>
        </div>

        <nav className="site-footer-nav" aria-label="Footer navigation">
          <h2>Explore</h2>
          {footerLinks.map((item) => (
            <Link key={item.to} to={item.to}>{item.label}</Link>
          ))}
        </nav>
      </div>

      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} CarRent</span>
        <span className="site-footer-credit">Made by <strong>@webdevchandan</strong></span>
        <span>Drive your journey</span>
      </div>
    </footer>
  );
}

export default Footer;
