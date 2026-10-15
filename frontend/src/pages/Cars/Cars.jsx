import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Heart,
  MapPin,
  Fuel,
  Gauge,
  X,
} from "lucide-react";

import Navbar from "../../components/Navbar/Navbar";
import { useFavorites } from "../../hooks/useFavorites";
import { useCars } from "../../context/CarsContext";

import "./Cars.css";


const Cars = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("search") || "";
  const category = searchParams.get("type") || "";
  const categoryTitle = { suv: "SUV", sedan: "Sedan", premium: "Premium" }[category];
  const search = query;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { carsData } = useCars();

  const updateSearch = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) nextParams.set("search", value);
    else nextParams.delete("search");
    setSearchParams(nextParams, { replace: true });
  };

  const filteredCars = carsData.filter((car) => {
    const matchesSearch = `${car.brand} ${car.model} ${car.type}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category === "suv"
      ? car.type.toLowerCase() === "suv"
      : category === "sedan"
        ? car.type.toLowerCase() === "sedan"
        : category === "premium"
          ? car.priceValue >= 7000000
          : true;
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    nextParams.delete("type");
    setSearchParams(nextParams, { replace: true });
  };

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

          <div className="cars-search" role="search">
            <Search size={20} aria-hidden="true" />

            <input
              type="search"
              placeholder="Search brand, model or type..."
              aria-label="Search cars by brand, model or type"
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="cars-search-clear" onClick={() => updateSearch("")} aria-label="Clear car search">
                <X size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </section>

        {/* CONTENT */}

        <section className="cars-content">

          <div className="cars-result-info">
              <h2>{categoryTitle ? `${categoryTitle} Cars` : "Available Cars"}</h2>

            <span>
              <span aria-live="polite">{filteredCars.length} {filteredCars.length === 1 ? "car" : "cars"} found</span>
            </span>
          </div>

          {filteredCars.length === 0 ? (
            <div className="cars-empty">
              <h3>
                No cars found
              </h3>

              <p>
                Try another search or browse all available cars.
              </p>
              <button className="cars-reset-search" type="button" onClick={clearFilters}>Clear filters</button>
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
                      loading="lazy"
                      decoding="async"
                    />

                    <button
                      className={`favorite-button ${isFavorite(car, "buy") ? "active" : ""}`}
                      type="button"
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
