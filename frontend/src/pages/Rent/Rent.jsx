import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Heart,
  MapPin,
  Fuel,
  Gauge,
  Users,
  CalendarDays,
  X,
} from "lucide-react";

import Navbar from "../../components/Navbar/Navbar";
import { useFavorites } from "../../hooks/useFavorites";
import { useCars } from "../../context/CarsContext";
import "./Rent.css";


const Rent = () => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { rentalCars } = useCars();

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [fuel, setFuel] = useState("");
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [sort, setSort] = useState("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const currentDate = new Date();
  const today = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const filteredCars = useMemo(() => {
    let result = rentalCars.filter((car) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        car.name.toLowerCase().includes(searchText) ||
        car.brand.toLowerCase().includes(searchText);

      const matchesBrand =
        !brand || car.brand === brand;

      const matchesFuel =
        !fuel || car.fuel === fuel;

      const matchesLocation =
        !location || car.location === location;

      let matchesPrice = true;

      if (priceRange === "under5000") {
        matchesPrice = car.pricePerDay < 5000;
      }

      if (priceRange === "5000to7500") {
        matchesPrice =
          car.pricePerDay >= 5000 &&
          car.pricePerDay <= 7500;
      }

      if (priceRange === "above7500") {
        matchesPrice = car.pricePerDay > 7500;
      }

      return (
        matchesSearch &&
        matchesBrand &&
        matchesFuel &&
        matchesLocation &&
        matchesPrice
      );
    });

    if (sort === "lowToHigh") {
      result = [...result].sort(
        (a, b) => a.pricePerDay - b.pricePerDay
      );
    }

    if (sort === "highToLow") {
      result = [...result].sort(
        (a, b) => b.pricePerDay - a.pricePerDay
      );
    }

    if (sort === "newest") {
      result = [...result].sort(
        (a, b) => b.year - a.year
      );
    }

    return result;
  }, [
    search,
    brand,
    priceRange,
    fuel,
    location,
    sort,
    rentalCars,
  ]);

  const clearFilters = () => {
    setSearch("");
    setBrand("");
    setPriceRange("");
    setFuel("");
    setLocation("");
    setPickupDate("");
    setReturnDate("");
    setSort("recommended");
  };

  const hasFilters =
    search ||
    brand ||
    priceRange ||
    fuel ||
    location ||
    pickupDate ||
    returnDate;

  const handleRentNow = (car) => {
    const params = new URLSearchParams({ type: "rent" });
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    navigate(`/car/${car.id}?${params.toString()}`);
  };

  return (
    <div className="rent-page">
      <Navbar />

      {/* HERO */}
      <section className="rent-header">
        <div className="rent-header-content">
          <span className="rent-eyebrow">
            RENT YOUR NEXT CAR
          </span>

          <h1>
            Drive more.
            <span> Worry less.</span>
          </h1>

          <p>
            Choose from premium cars, select your dates,
            and enjoy a smooth rental experience.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="rent-search-section">
        <div className="rent-search-box">
          <div className="rent-search-input">
            <Search size={20} />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand, model or keyword..."
            />

            {search && (
              <button
                className="rent-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            className={`rent-filter-button ${
              filtersOpen ? "active" : ""
            }`}
            type="button"
            onClick={() =>
              setFiltersOpen(!filtersOpen)
            }
            aria-expanded={filtersOpen}
            aria-controls="rent-filter-row"
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>

          <button
            className="rent-search-button"
            type="button"
            onClick={() => {
              document
                .querySelector(".rent-listings")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            Find Cars
          </button>
        </div>

        {/* DATES */}
        <div className="rent-date-row">
          <div className="rent-date-field">
            <CalendarDays size={17} />

            <div>
              <span>Pickup Date</span>

              <input
                type="date"
                value={pickupDate}
                min={today}
                onChange={(e) =>
                  {
                    setPickupDate(e.target.value);
                    if (returnDate && returnDate <= e.target.value) setReturnDate("");
                  }
                }
              />
            </div>
          </div>

          <div className="rent-date-field">
            <CalendarDays size={17} />

            <div>
              <span>Return Date</span>

              <input
                type="date"
                value={returnDate}
                min={pickupDate || today}
                onChange={(e) =>
                  setReturnDate(e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div
          id="rent-filter-row"
          className={`rent-filter-row ${
            filtersOpen ? "mobile-filter-open" : ""
          }`}
        >
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            <option value="BMW">BMW</option>
            <option value="Mercedes-Benz">
              Mercedes-Benz
            </option>
            <option value="Audi">Audi</option>
          </select>

          <select
            value={priceRange}
            onChange={(e) =>
              setPriceRange(e.target.value)
            }
          >
            <option value="">Any Price</option>
            <option value="under5000">
              Under ₹5,000/day
            </option>
            <option value="5000to7500">
              ₹5,000 - ₹7,500/day
            </option>
            <option value="above7500">
              Above ₹7,500/day
            </option>
          </select>

          <select
            value={fuel}
            onChange={(e) => setFuel(e.target.value)}
          >
            <option value="">All Fuel Types</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <select
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
          >
            <option value="">All Locations</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Navi Mumbai">
              Navi Mumbai
            </option>
            <option value="Thane">Thane</option>
            <option value="Pune">Pune</option>
          </select>

          {hasFilters && (
            <button
              className="rent-clear-filters"
              onClick={clearFilters}
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </section>

      {/* LISTINGS */}
      <section className="rent-listings">
        <div className="rent-listings-header">
          <div>
            <span className="rent-section-label">
              AVAILABLE FOR RENT
            </span>

            <h2>
              Choose your <span>ride.</span>
            </h2>

            <p>
              {filteredCars.length}{" "}
              {filteredCars.length === 1
                ? "car"
                : "cars"}{" "}
              available for your journey.
            </p>
          </div>

          <select
            className="rent-sort-button"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recommended">
              Recommended
            </option>

            <option value="lowToHigh">
              Price: Low to High
            </option>

            <option value="highToLow">
              Price: High to Low
            </option>

            <option value="newest">
              Newest First
            </option>
          </select>
        </div>

        {/* CAR GRID */}
        {filteredCars.length > 0 ? (
          <div className="rent-car-grid">
            {filteredCars.map((car) => (
              <article
                className="rent-car-card"
                key={car.id}
              >
                <div className="rent-car-image">
                  <img
                    src={car.image}
                    alt={car.name}
                  />

                  <span className="rent-car-badge">
                    {car.badge}
                  </span>

                  <button
                    className={`rent-favorite ${isFavorite(car, "rent") ? "active" : ""}`}
                    type="button"
                    onClick={() => toggleFavorite(car, "rent")}
                    aria-label={isFavorite(car, "rent") ? `Remove ${car.name} from favorites` : `Add ${car.name} to favorites`}
                  >
                    <Heart size={19} fill={isFavorite(car, "rent") ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="rent-car-content">
                  <div className="rent-car-title">
                    <div>
                      <h3>{car.name}</h3>

                      <span>
                        {car.year} •{" "}
                        {car.transmission}
                      </span>
                    </div>

                    <strong>
                      {car.priceLabel}
                    </strong>
                  </div>

                  <div className="rent-car-location">
                    <MapPin size={14} />
                    {car.location}
                  </div>

                  <div className="rent-car-specs">
                    <span>
                      <Fuel size={14} />
                      {car.fuel}
                    </span>

                    <span>
                      <Gauge size={14} />
                      {car.mileage}
                    </span>

                    <span>
                      <Users size={14} />
                      {car.seats} Seats
                    </span>
                  </div>

                  <button
                    className="rent-now-button"
                    onClick={() =>
                      handleRentNow(car)
                    }
                  >
                    Rent Now
                    <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rent-no-results">
            <div className="rent-no-results-icon">
              <Search size={28} />
            </div>

            <h3>No rental cars found</h3>

            <p>
              Try changing your search or filter options.
            </p>

            <button
              className="rent-reset-button"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Rent;
