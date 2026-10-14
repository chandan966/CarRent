import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  MapPin,
  Fuel,
  Gauge,
} from "lucide-react";

import Navbar from "../../components/Navbar/Navbar";
import { useFavorites } from "../../hooks/useFavorites";
import { carsData } from "../../data/cars";

import "./Cars.css";


const Cars = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { isFavorite, toggleFavorite } = useFavorites();

  const filteredCars = carsData.filter((car) =>
    `${car.brand} ${car.model} ${car.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <main className="cars-page">

        {/* HEADER */}

        <section className="cars-header">
          <div>
            <span className="cars-label">
              EXPLORE CARS
            </span>

            <h1>
              Find Your Perfect Car
            </h1>

            <p>
              Browse our collection of quality cars available
              for purchase.
            </p>
          </div>

          <div className="cars-search">
            <Search size={20} />

            <input
              type="text"
              placeholder="Search brand, model or type..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </section>

        {/* CONTENT */}

        <section className="cars-content">

          <div className="cars-result-info">
            <h2>
              Available Cars
            </h2>

            <span>
              {filteredCars.length} cars found
            </span>
          </div>

          {filteredCars.length === 0 ? (
            <div className="cars-empty">
              <h3>
                No cars found
              </h3>

              <p>
                Try searching for another brand or model.
              </p>
            </div>
          ) : (
            <div className="cars-grid">

              {filteredCars.map((car) => (

                <article
                  className="car-card"
                  key={car.id}
                >

                  {/* IMAGE */}

                  <div className="car-image-wrapper">

                    <img
                      src={car.image}
                      alt={car.name}
                    />

                    <button
                      className={`favorite-button ${isFavorite(car, "buy") ? "active" : ""}`}
                      onClick={() =>
                        toggleFavorite({ ...car, detailRoute: "/cars" }, "buy")
                      }
                      aria-label={
                        isFavorite(car, "buy")
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      aria-pressed={isFavorite(car, "buy")}
                    >
                      <Heart
                        size={19}
                        fill={
                          isFavorite(car, "buy")
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                    <span className="car-type">
                      {car.type}
                    </span>

                  </div>

                  {/* INFO */}

                  <div className="car-info">

                    <div className="car-title">

                      <div>
                        <h3>
                          {car.name}
                        </h3>

                        <span>
                          {car.year}
                        </span>
                      </div>

                      <strong>
                        {car.price}
                      </strong>

                    </div>

                    {/* SPECS */}

                    <div className="car-specs">

                      <span>
                        <Fuel size={16} />
                        {car.fuel}
                      </span>

                      <span>
                        <Gauge size={16} />
                        {car.mileage}
                      </span>

                      <span>
                        <MapPin size={16} />
                        {car.location}
                      </span>

                    </div>

                    {/* BUTTON */}

                    <button
                      className="car-details-button"
                      type="button"
                      onClick={() => navigate(`/cars/${car.id}`)}
                    >
                      View Details
                    </button>

                  </div>

                </article>

              ))}

            </div>
          )}

        </section>

      </main>
    </>
  );
};

export default Cars;
