import { Link } from "react-router-dom";
import { ArrowRight, CarFront } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import "./NotFound.css";

function NotFound() {
  return (
    <>
      <Navbar />
      <main className="not-found-page">
        <section className="not-found-card" aria-labelledby="not-found-title">
          <span className="not-found-icon"><CarFront size={28} aria-hidden="true" /></span>
          <p className="not-found-code">ERROR 404</p>
          <h1 id="not-found-title">This road ends here.</h1>
          <p className="not-found-copy">We couldn’t find that page. Head back to CarRent or browse the cars available now.</p>
          <div className="not-found-actions">
            <Link className="not-found-primary" to="/">Go to home <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link className="not-found-secondary" to="/cars">Browse cars</Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default NotFound;
