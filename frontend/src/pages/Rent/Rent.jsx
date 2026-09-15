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

import Navbar from "../../components/navbar/Navbar";
import "./Rent.css";

const rentalCars = [
  {
    id: 1,
    name: "BMW 3 Series",
    brand: "BMW",
    year: 2024,
    pricePerDay: 4500,
    priceLabel: "₹4,500/day",
    location: "Mumbai",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    mileage: "14.2 km/l",
    image:
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=85",
    badge: "POPULAR",
  },
  {
    id: 2,
    name: "Mercedes-Benz C-Class",
    brand: "Mercedes-Benz",
    year: 2024,
    pricePerDay: 5500,
    priceLabel: "₹5,500/day",
    location: "Navi Mumbai",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    mileage: "16.9 km/l",
    image:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=85",
    badge: "PREMIUM",
  },
  {
    id: 3,
    name: "Audi A6",
    brand: "Audi",
    year: 2025,
    pricePerDay: 6000,
    priceLabel: "₹6,000/day",
    location: "Thane",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    mileage: "14.1 km/l",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=85",
    badge: "NEW",
  },
  {
    id: 4,
    name: "BMW X5",
    brand: "BMW",
    year: 2024,
    pricePerDay: 8500,
    priceLabel: "₹8,500/day",
    location: "Mumbai",
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 5,
    mileage: "12.4 km/l",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=85",
    badge: "LUXURY",
  },
  {
    id: 5,
    name: "Mercedes-Benz GLC",
    brand: "Mercedes-Benz",
    year: 2024,
    pricePerDay: 7000,
    priceLabel: "₹7,000/day",
    location: "Pune",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    mileage: "14.7 km/l",
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85",
    badge: "FEATURED",
  },
  {
    id: 6,
    name: "Audi Q7",
    brand: "Audi",
    year: 2025,
    pricePerDay: 9000,
    priceLabel: "₹9,000/day",
    location: "Navi Mumbai",
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 7,
    mileage: "11.8 km/l",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=85",
    badge: "PREMIUM",
  },
];

const Rent = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [fuel, setFuel] = useState("");
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [sort, setSort] = useState("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    navigate(`/car/${car.id}?type=rent`);
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
            onClick={() =>
              setFiltersOpen(!filtersOpen)
            }
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>

          <button
            className="rent-search-button"
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
                onChange={(e) =>
                  setPickupDate(e.target.value)
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
                onChange={(e) =>
                  setReturnDate(e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div
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
                    className="rent-favorite"
                    aria-label={`Add ${car.name} to favorites`}
                  >
                    <Heart size={19} />
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