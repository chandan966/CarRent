import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";
import { useFavorites } from "../../hooks/useFavorites";
import { buyCars } from "../../data/cars";
const featuredCars = buyCars.slice(0, 3);


const Home = () => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <div className="home-page">
      <Navbar />

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">
            PREMIUM AUTOMOTIVE MARKETPLACE
          </span>

          <h1>
            Find the car that
            <span> fits your journey.</span>
          </h1>

          <p>
            Buy, rent or sell cars with a smarter,
            simpler and more trusted automotive experience.
          </p>

          <div className="home-actions">
            <button onClick={() => navigate("/cars")}>
              Explore Cars
            </button>

            <button onClick={() => navigate("/rent")}>
              Rent a Car
            </button>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="home-intro">
        <span>CARRENT</span>

        <h2>
          Everything you need,
          <span> in one place.</span>
        </h2>

        <p>
          Discover quality vehicles, flexible rentals and
          effortless car selling—all from one platform.
        </p>
      </section>

      {/* POPULAR CARS */}
      <section className="popular-cars">
        <div className="popular-cars-header">
          <div>
            <span className="section-label">
              FEATURED COLLECTION
            </span>

            <h2>
              Popular <span>cars.</span>
            </h2>

            <p>
              Explore some of the most popular vehicles
              available on our marketplace.
            </p>
          </div>

          <button
            className="view-all-cars"
            onClick={() => navigate("/cars")}
          >
            View All Cars →
          </button>
        </div>

        <div className="car-grid">

          {/* BMW */}
          <article className="car-card">
            <div className="car-image">
              <img
                src={featuredCars[0].image}
                alt={featuredCars[0].name}
              />

              <span className="car-badge">
                FEATURED
              </span>

              <button
                className={`favorite-button ${isFavorite(featuredCars[0], "buy") ? "active" : ""}`}
                onClick={() => toggleFavorite(featuredCars[0], "buy")}
                aria-label={isFavorite(featuredCars[0], "buy") ? "Remove BMW 3 Series from favorites" : "Add BMW 3 Series to favorites"}
                type="button"
              >
                <Heart size={20} fill={isFavorite(featuredCars[0], "buy") ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="car-info">
              <div className="car-title-row">
                <div>
                  <h3>{featuredCars[0].name}</h3>

                  <span>
                    {featuredCars[0].year} • {featuredCars[0].transmission} • {featuredCars[0].fuel}
                  </span>
                </div>

                <strong>{featuredCars[0].priceLabel}</strong>
              </div>

              <div className="car-meta">
                <span>📍 {featuredCars[0].location}</span>
                <span>● Available</span>
              </div>

              <button
                className="car-details-button"
                onClick={() => navigate("/buy/1")}
              >
                View Details →
              </button>
            </div>
          </article>

          {/* MERCEDES */}
          <article className="car-card">
            <div className="car-image">
              <img
                src={featuredCars[1].image}
                alt={featuredCars[1].name}
              />

              <span className="car-badge">
                POPULAR
              </span>

              <button
                className={`favorite-button ${isFavorite(featuredCars[1], "buy") ? "active" : ""}`}
                onClick={() => toggleFavorite(featuredCars[1], "buy")}
                aria-label={isFavorite(featuredCars[1], "buy") ? "Remove Mercedes-Benz C-Class from favorites" : "Add Mercedes-Benz C-Class to favorites"}
                type="button"
              >
                <Heart size={20} fill={isFavorite(featuredCars[1], "buy") ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="car-info">
              <div className="car-title-row">
                <div>
                  <h3>{featuredCars[1].name}</h3>

                  <span>
                    {featuredCars[1].year} • {featuredCars[1].transmission} • {featuredCars[1].fuel}
                  </span>
                </div>

                <strong>{featuredCars[1].priceLabel}</strong>
              </div>

              <div className="car-meta">
                <span>📍 {featuredCars[1].location}</span>
                <span>● Available</span>
              </div>

              <button
                className="car-details-button"
                onClick={() => navigate("/buy/2")}
              >
                View Details →
              </button>
            </div>
          </article>

          {/* AUDI */}
          <article className="car-card">
            <div className="car-image">
              <img
                src={featuredCars[2].image}
                alt={featuredCars[2].name}
              />

              <span className="car-badge">
                NEW
              </span>

              <button
                className={`favorite-button ${isFavorite(featuredCars[2], "buy") ? "active" : ""}`}
                onClick={() => toggleFavorite(featuredCars[2], "buy")}
                aria-label={isFavorite(featuredCars[2], "buy") ? "Remove Audi A6 from favorites" : "Add Audi A6 to favorites"}
                type="button"
              >
                <Heart size={20} fill={isFavorite(featuredCars[2], "buy") ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="car-info">
              <div className="car-title-row">
                <div>
                  <h3>{featuredCars[2].name}</h3>

                  <span>
                    {featuredCars[2].year} • {featuredCars[2].transmission} • {featuredCars[2].fuel}
                  </span>
                </div>

                <strong>{featuredCars[2].priceLabel}</strong>
              </div>

              <div className="car-meta">
                <span>📍 {featuredCars[2].location}</span>
                <span>● Available</span>
              </div>

              <button
                className="car-details-button"
                onClick={() => navigate("/buy/3")}
              >
                View Details →
              </button>
            </div>
          </article>

        </div>
      </section>

      {/* CAR CATEGORIES */}
      <section className="car-categories">
        <div className="categories-header">
          <div>
            <span className="section-label">
              BROWSE BY TYPE
            </span>

            <h2>
              Find the right <span>car.</span>
            </h2>

            <p>
              Explore vehicles by category and find the perfect
              match for your lifestyle.
            </p>
          </div>
        </div>

        <div className="category-grid">

          {/* SUV */}
          <button className="category-card">
            <div className="category-icon">
              🚙
            </div>

            <div className="category-content">
              <h3>SUVs</h3>
              <span>120+ Cars</span>
            </div>

            <strong>→</strong>
          </button>

          {/* SEDAN */}
          <button className="category-card">
            <div className="category-icon">
              🚘
            </div>

            <div className="category-content">
              <h3>Sedans</h3>
              <span>95+ Cars</span>
            </div>

            <strong>→</strong>
          </button>

          {/* LUXURY */}
          <button className="category-card">
            <div className="category-icon">
              🏎️
            </div>

            <div className="category-content">
              <h3>Luxury</h3>
              <span>60+ Cars</span>
            </div>

            <strong>→</strong>
          </button>

          {/* ELECTRIC */}
          <button className="category-card">
            <div className="category-icon">
              ⚡
            </div>

            <div className="category-content">
              <h3>Electric</h3>
              <span>45+ Cars</span>
            </div>

            <strong>→</strong>
          </button>

        </div>
      </section>

      {/* WHY CHOOSE CARRENT */}
      <section className="why-carrent">
        <div className="why-carrent-header">
          <span className="section-label">
            WHY CARRENT
          </span>

          <h2>
            Built around <span>your journey.</span>
          </h2>

          <p>
            Everything is designed to make buying, renting and
            selling a car simple, secure and stress-free.
          </p>
        </div>

        <div className="why-carrent-grid">

          {/* VERIFIED VEHICLES */}
          <article className="why-card">
            <div className="why-icon">
              ✓
            </div>

            <h3>Verified Vehicles</h3>

            <p>
              Discover quality vehicles with verified details
              and transparent information.
            </p>

            <span className="why-number">
              01
            </span>
          </article>

          {/* SECURE TRANSACTIONS */}
          <article className="why-card">
            <div className="why-icon">
              🔒
            </div>

            <h3>Secure Transactions</h3>

            <p>
              Your bookings, payments and personal information
              are handled with security in mind.
            </p>

            <span className="why-number">
              02
            </span>
          </article>

          {/* FLEXIBLE RENTALS */}
          <article className="why-card">
            <div className="why-icon">
              ↗
            </div>

            <h3>Flexible Rentals</h3>

            <p>
              Choose vehicles, dates and rental options that
              fit your plans and lifestyle.
            </p>

            <span className="why-number">
              03
            </span>
          </article>

          {/* DEDICATED SUPPORT */}
          <article className="why-card">
            <div className="why-icon">
              ?
            </div>

            <h3>Dedicated Support</h3>

            <p>
              Get reliable assistance whenever you need help
              with your vehicle or booking.
            </p>

            <span className="why-number">
              04
            </span>
          </article>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="how-it-works-header">
          <span className="section-label">
            HOW IT WORKS
          </span>

          <h2>
            Your journey starts <span>here.</span>
          </h2>

          <p>
            Whether you want to buy, rent or sell a car,
            CarRent keeps the entire experience simple.
          </p>
        </div>

        <div className="steps-wrapper">

          {/* STEP 01 */}
          <div className="work-step">
            <div className="step-number">
              01
            </div>

            <div className="step-content">
              <h3>Choose Your Car</h3>

              <p>
                Browse our collection, compare vehicles and
                find the car that matches your needs.
              </p>
            </div>
          </div>

          <div className="step-line"></div>

          {/* STEP 02 */}
          <div className="work-step">
            <div className="step-number">
              02
            </div>

            <div className="step-content">
              <h3>Connect & Book</h3>

              <p>
                Check availability, review the details and
                continue with your booking or purchase.
              </p>
            </div>
          </div>

          <div className="step-line"></div>

          {/* STEP 03 */}
          <div className="work-step">
            <div className="step-number">
              03
            </div>

            <div className="step-content">
              <h3>Drive With Confidence</h3>

              <p>
                Complete the process and enjoy a smoother,
                more transparent automotive experience.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
