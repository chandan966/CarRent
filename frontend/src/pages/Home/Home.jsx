import "./Home.css";
import Navbar from "../../components/navbar/Navbar";

const Home = () => {
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
            <button>Explore Cars</button>
            <button>Rent a Car</button>
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

          <button className="view-all-cars">
            View All Cars →
          </button>
        </div>

        <div className="car-grid">

          {/* BMW */}
          <article className="car-card">
            <div className="car-image">
              <img
                src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=85"
                alt="BMW 3 Series"
              />

              <span className="car-badge">
                FEATURED
              </span>

              <button
                className="favorite-button"
                aria-label="Add BMW 3 Series to favorites"
              >
                ♡
              </button>
            </div>

            <div className="car-info">
              <div className="car-title-row">
                <div>
                  <h3>BMW 3 Series</h3>

                  <span>
                    2024 • Automatic • Petrol
                  </span>
                </div>

                <strong>₹45L</strong>
              </div>

              <div className="car-meta">
                <span>📍 Mumbai</span>
                <span>● Available</span>
              </div>

              <button className="car-details-button">
                View Details →
              </button>
            </div>
          </article>

          {/* MERCEDES */}
          <article className="car-card">
            <div className="car-image">
              <img
                src="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1000&q=85"
                alt="Mercedes-Benz C-Class"
              />

              <span className="car-badge">
                POPULAR
              </span>

              <button
                className="favorite-button"
                aria-label="Add Mercedes-Benz C-Class to favorites"
              >
                ♡
              </button>
            </div>

            <div className="car-info">
              <div className="car-title-row">
                <div>
                  <h3>Mercedes-Benz C-Class</h3>

                  <span>
                    2024 • Automatic • Petrol
                  </span>
                </div>

                <strong>₹58L</strong>
              </div>

              <div className="car-meta">
                <span>📍 Navi Mumbai</span>
                <span>● Available</span>
              </div>

              <button className="car-details-button">
                View Details →
              </button>
            </div>
          </article>

          {/* AUDI */}
          <article className="car-card">
            <div className="car-image">
              <img
                src="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=85"
                alt="Audi A6"
              />

              <span className="car-badge">
                NEW
              </span>

              <button
                className="favorite-button"
                aria-label="Add Audi A6 to favorites"
              >
                ♡
              </button>
            </div>

            <div className="car-info">
              <div className="car-title-row">
                <div>
                  <h3>Audi A6</h3>

                  <span>
                    2025 • Automatic • Petrol
                  </span>
                </div>

                <strong>₹65L</strong>
              </div>

              <div className="car-meta">
                <span>📍 Thane</span>
                <span>● Available</span>
              </div>

              <button className="car-details-button">
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