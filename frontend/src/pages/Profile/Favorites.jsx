import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ArrowLeft,
  CarFront,
  MapPin,
  Fuel,
  Gauge,
  ChevronRight,
} from "lucide-react";

import Navbar from "../../components/navbar/Navbar";

import "./Favorites.css";

function Favorites() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteCars");

    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);

        // Remove duplicate cars by ID
        const uniqueFavorites = parsedFavorites.filter(
          (car, index, self) =>
            index === self.findIndex((item) => item.id === car.id)
        );

        setCars(uniqueFavorites);

        // Save cleaned list back
        localStorage.setItem(
          "favoriteCars",
          JSON.stringify(uniqueFavorites)
        );
      } catch (error) {
        console.error("Error loading favorites:", error);
        setCars([]);
      }
    }
  }, []);

  const removeFavorite = (id) => {
    setCars((previousCars) => {
      const updatedCars = previousCars.filter(
        (car) => car.id !== id
      );

      localStorage.setItem(
        "favoriteCars",
        JSON.stringify(updatedCars)
      );

      return updatedCars;
    });
  };

  return (
    <>
      <Navbar />

      <main className="favorites-page">
        <div className="favorites-container">

          {/* HEADER */}
          <section className="favorites-header">
            <button
              className="favorites-back-button"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft size={18} />
              Back to Profile
            </button>

            <div className="favorites-title-row">
              <div>
                <span className="favorites-eyebrow">
                  MY COLLECTION
                </span>

                <h1>
                  Your <span>Favorites</span>
                </h1>

                <p>
                  Keep track of the cars you love and compare them
                  whenever you're ready.
                </p>
              </div>

              <div className="favorites-title-icon">
                <Heart size={30} />
              </div>
            </div>

            <div className="favorites-count">
              <Heart size={16} />
              <span>
                {cars.length}{" "}
                {cars.length === 1 ? "car" : "cars"} saved
              </span>
            </div>
          </section>

          {/* EMPTY STATE */}
          {cars.length === 0 ? (
            <section className="favorites-empty">
              <div className="favorites-empty-icon">
                <Heart size={42} />
              </div>

              <h2>Your favorites are empty</h2>

              <p>
                You haven't saved any cars yet. Explore our collection
                and save the cars you like.
              </p>

              <button
                className="favorites-browse-button"
                onClick={() => navigate("/buy")}
              >
                Browse Cars
                <ChevronRight size={18} />
              </button>
            </section>
          ) : (
            /* CAR GRID */
            <section className="favorites-grid">
              {cars.map((car, index) => (
                <article
                  className="favorite-car-card"
                  key={car.id}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="favorite-car-image-wrapper">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="favorite-car-image"
                    />

                    <div className="favorite-image-overlay"></div>

                    <span className="favorite-car-year">
                      {car.year}
                    </span>

                    <button
                      className="favorite-remove-button"
                      onClick={() => removeFavorite(car.id)}
                      aria-label={`Remove ${car.name} from favorites`}
                      title="Remove from favorites"
                    >
                      <Heart size={18} fill="currentColor" />
                    </button>

                    <span className="favorite-saved-label">
                      <Heart size={13} fill="currentColor" />
                      Saved
                    </span>
                  </div>

                  <div className="favorite-car-content">
                    <div className="favorite-car-top">
                      <div>
                        <h2>{car.name}</h2>

                        <p className="favorite-car-location">
                          <MapPin size={14} />
                          {car.location}
                        </p>
                      </div>

                      <CarFront
                        className="favorite-car-icon"
                        size={21}
                      />
                    </div>

                    <div className="favorite-car-specs">
                      <div>
                        <Fuel size={15} />
                        <span>{car.fuel}</span>
                      </div>

                      <div>
                        <Gauge size={15} />
                        <span>{car.mileage}</span>
                      </div>

                      <div>
                        <span className="favorite-transmission-icon">
                          A
                        </span>
                        <span>{car.transmission}</span>
                      </div>
                    </div>

                    <div className="favorite-car-footer">
                      <div>
                        <span>Starting from</span>
                        <strong>{car.price}</strong>
                      </div>

                      <button
                        className="favorite-view-button"
                        onClick={() => navigate(`/buy/${car.id}`)}
                      >
                        View Details
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default Favorites;