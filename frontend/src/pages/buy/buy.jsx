import "./Buy.css";
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
  X,
} from "lucide-react";

import Navbar from "../../components/navbar/Navbar";
import "./Buy.css";

const cars = [
  {
    id: 1,
    name: "BMW 3 Series",
    brand: "BMW",
    year: 2023,
    price: 4850000,
    priceLabel: "₹48.50 Lakh",
    location: "Mumbai",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    mileage: "18,000 km",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80",
    badge: "Featured",
  },
  {
    id: 2,
    name: "Mercedes-Benz C-Class",
    brand: "Mercedes-Benz",
    year: 2022,
    price: 5290000,
    priceLabel: "₹52.90 Lakh",
    location: "Pune",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    mileage: "22,500 km",
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80",
    badge: "Popular",
  },
  {
    id: 3,
    name: "Audi A6",
    brand: "Audi",
    year: 2023,
    price: 6390000,
    priceLabel: "₹63.90 Lakh",
    location: "Thane",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    mileage: "12,800 km",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=80",
    badge: "New Arrival",
  },
  {
    id: 4,
    name: "BMW X5",
    brand: "BMW",
    year: 2022,
    price: 8990000,
    priceLabel: "₹89.90 Lakh",
    location: "Mumbai",
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 5,
    mileage: "25,000 km",
    image:
      "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1000&q=80",
    badge: "Premium",
  },
  {
    id: 5,
    name: "Mercedes-Benz GLC",
    brand: "Mercedes-Benz",
    year: 2023,
    price: 7480000,
    priceLabel: "₹74.80 Lakh",
    location: "Navi Mumbai",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    mileage: "15,500 km",
    image:
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1000&q=80",
    badge: "Featured",
  },
  {
    id: 6,
    name: "Audi Q7",
    brand: "Audi",
    year: 2022,
    price: 8690000,
    priceLabel: "₹86.90 Lakh",
    location: "Pune",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 7,
    mileage: "20,300 km",
    image:
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80",
    badge: "Luxury",
  },
];

const Buy = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [fuel, setFuel] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredCars = useMemo(() => {
    let result = [...cars];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (car) =>
          car.name.toLowerCase().includes(query) ||
          car.brand.toLowerCase().includes(query) ||
          car.location.toLowerCase().includes(query)
      );
    }

    if (brand) {
      result = result.filter((car) => car.brand === brand);
    }

    if (fuel) {
      result = result.filter((car) => car.fuel === fuel);
    }

    if (location) {
      result = result.filter((car) => car.location === location);
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "newest") {
      result.sort((a, b) => b.year - a.year);
    }

    return result;
  }, [search, brand, fuel, location, sort]);

  const clearFilters = () => {
    setSearch("");
    setBrand("");
    setFuel("");
    setLocation("");
    setSort("featured");
  };

  return (
    <div className="buy-page">
      <Navbar />

      {/* HERO */}
      <section className="buy-header">
        <div className="buy-header-content">
          <div className="buy-eyebrow">
            PREMIUM CAR MARKETPLACE
          </div>

          <h1>
            Find Your <span>Perfect Car</span>
          </h1>

          <p>
            Discover premium cars that match your lifestyle,
            budget and driving needs.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="buy-search-section">
        <div className="buy-search-box">
          <Search size={20} />

          <input
            className="buy-search-input"
            type="text"
            placeholder="Search cars, brands or models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="clear-search"
              type="button"
              onClick={() => setSearch("")}
            >
              <X size={17} />
            </button>
          )}

          <button
            className={`filter-button ${
              filtersOpen ? "active" : ""
            }`}
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>

          <button className="search-button" type="button">
            Search
          </button>
        </div>

        {/* FILTERS */}
        <div
          className={`filter-row ${
            filtersOpen ? "mobile-filter-open" : ""
          }`}
        >
          <select
            className="filter-select"
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
            className="filter-select"
            value={fuel}
            onChange={(e) => setFuel(e.target.value)}
          >
            <option value="">Any Fuel</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
          </select>

          <select
            className="filter-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Any Location</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Thane">Thane</option>
            <option value="Navi Mumbai">
              Navi Mumbai
            </option>
            <option value="Pune">Pune</option>
          </select>

          <button
            className="clear-filters"
            type="button"
            onClick={clearFilters}
          >
            Clear All
          </button>
        </div>
      </section>

      {/* LISTINGS */}
      <main className="buy-listings">
        <div className="buy-listings-header">
          <div>
            <span className="section-label">
              OUR COLLECTION
            </span>

            <h2>
              Available <span>Cars</span>
            </h2>

            <p>
              {filteredCars.length} premium vehicles available
            </p>
          </div>

          <div className="sort-button">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {filteredCars.length > 0 ? (
          <div className="buy-car-grid">
            {filteredCars.map((car) => (
              <article
                className="buy-car-card"
                key={car.id}
              >
                <div className="buy-car-image">
                  <img
                    src={car.image}
                    alt={car.name}
                  />

                  {car.badge && (
                    <span className="buy-car-badge">
                      {car.badge}
                    </span>
                  )}

                  <button
                    className="buy-favorite"
                    type="button"
                    aria-label="Add to favorites"
                  >
                    <Heart size={18} />
                  </button>
                </div>

                <div className="buy-car-content">
                  <h3 className="buy-car-title">
                    {car.name}
                  </h3>

                  <div className="buy-car-location">
                    <MapPin size={15} />
                    <span>{car.location}</span>
                  </div>

                  <div className="buy-car-specs">
                    <span>
                      <Fuel size={15} />
                      {car.fuel}
                    </span>

                    <span>
                      <Gauge size={15} />
                      {car.mileage}
                    </span>

                    <span>
                      <Users size={15} />
                      {car.seats} Seats
                    </span>
                  </div>

                  <div className="buy-car-bottom">
                    <strong>{car.priceLabel}</strong>

                    <button
                      className="view-car-button"
                      type="button"
                      onClick={() =>
                        navigate(`/buy/${car.id}`)
                      }
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">
              <Search size={30} />
            </div>

            <h3>No cars found</h3>

            <p>
              Try changing your search or filter options.
            </p>

            <button
              className="reset-results-button"
              type="button"
              onClick={clearFilters}
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Buy;