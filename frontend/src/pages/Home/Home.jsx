import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";
import { useFavorites } from "../../hooks/useFavorites";
import { useCars } from "../../context/CarsContext";


const Home = () => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { buyCars } = useCars();
  const featuredCars = buyCars.slice(0, 3);
  const carCategories = [
    { title: "SUVs", icon: "🚙", type: "suv", count: buyCars.filter((car) => car.type.toLowerCase() === "suv").length },
    { title: "Sedans", icon: "🚘", type: "sedan", count: buyCars.filter((car) => car.type.toLowerCase() === "sedan").length },
    { title: "Premium", icon: "🏎️", type: "premium", count: buyCars.filter((car) => car.price >= 7000000).length },
    { title: "All Cars", icon: "🚗", type: "", count: buyCars.length },
  ];

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
          {featuredCars.map((car) => {
            const favorite = isFavorite(car, "buy");
            return (
              <article className="car-card" key={car.id}>
                <div className="car-image">
                  <img src={car.image} alt={car.name} loading="lazy" />
                  <span className="car-badge">{car.badge || "FEATURED"}</span>
                  <button className={`favorite-button ${favorite ? "active" : ""}`} onClick={() => toggleFavorite(car, "buy")} aria-label={`${favorite ? "Remove" : "Add"} ${car.name} ${favorite ? "from" : "to"} favorites`} aria-pressed={favorite} type="button">
                    <Heart size={20} fill={favorite ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="car-info">
                  <div className="car-title-row">
                    <div><h3>{car.name}</h3><span>{car.year} • {car.transmission} • {car.fuel}</span></div>
                    <strong>{car.priceLabel}</strong>
                  </div>
                  <div className="car-meta"><span>📍 {car.location}</span><span>● Available</span></div>
                  <button className="car-details-button" type="button" onClick={() => navigate(`/buy/${car.id}`)}>View Details →</button>
                </div>
              </article>
            );
          })}
          {featuredCars.length === 0 && <p>No active cars are listed right now.</p>}
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
          {carCategories.map((category) => (
            <button
              className="category-card"
              key={category.type || "all"}
              type="button"
              onClick={() => navigate(category.type ? `/cars?type=${category.type}` : "/cars")}
              aria-label={`Browse ${category.title}, ${category.count} cars`}
            >
              <div className="category-icon" aria-hidden="true">{category.icon}</div>
              <div className="category-content">
                <h3>{category.title}</h3>
                <span>{category.count} {category.count === 1 ? "car" : "cars"}</span>
              </div>
              <strong aria-hidden="true">→</strong>
            </button>
          ))}
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
