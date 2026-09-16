import { useEffect, useState } from "react";
import {
  Search,
  Heart,
  MapPin,
  Fuel,
  Gauge,
} from "lucide-react";

import Navbar from "../../components/navbar/Navbar";

import "./Cars.css";

const carsData = [
  {
    id: 1,
    name: "BMW 3 Series",
    brand: "BMW",
    model: "3 Series",
    year: 2024,
    price: "₹45,00,000",
    type: "Sedan",
    fuel: "Petrol",
    mileage: "15 km/l",
    transmission: "Automatic",
    location: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Mercedes-Benz C-Class",
    brand: "Mercedes-Benz",
    model: "C-Class",
    year: 2024,
    price: "₹58,00,000",
    type: "Sedan",
    fuel: "Petrol",
    mileage: "14 km/l",
    transmission: "Automatic",
    location: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Toyota Fortuner",
    brand: "Toyota",
    model: "Fortuner",
    year: 2024,
    price: "₹42,00,000",
    type: "SUV",
    fuel: "Diesel",
    mileage: "12 km/l",
    transmission: "Automatic",
    location: "Thane",
    image:
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Hyundai Creta",
    brand: "Hyundai",
    model: "Creta",
    year: 2024,
    price: "₹18,50,000",
    type: "SUV",
    fuel: "Petrol",
    mileage: "17 km/l",
    transmission: "Automatic",
    location: "Navi Mumbai",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Tata Harrier",
    brand: "Tata",
    model: "Harrier",
    year: 2024,
    price: "₹24,00,000",
    type: "SUV",
    fuel: "Diesel",
    mileage: "16 km/l",
    transmission: "Automatic",
    location: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Audi A4",
    brand: "Audi",
    model: "A4",
    year: 2024,
    price: "₹52,00,000",
    type: "Sedan",
    fuel: "Petrol",
    mileage: "16 km/l",
    transmission: "Automatic",
    location: "Thane",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
  },
];

const Cars = () => {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);

  // Load saved favorites
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteCars");

    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);

        const favoriteIds = parsedFavorites.map((car) => car.id);

        setFavorites(favoriteIds);
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    }
  }, []);

  // Add/remove favorite
  const toggleFavorite = (car) => {
    const savedFavorites =
      JSON.parse(localStorage.getItem("favoriteCars")) || [];

    const alreadyFavorite = savedFavorites.some(
      (favoriteCar) => favoriteCar.id === car.id
    );

    let updatedFavorites;

    if (alreadyFavorite) {
      updatedFavorites = savedFavorites.filter(
        (favoriteCar) => favoriteCar.id !== car.id
      );
    } else {
      updatedFavorites = [...savedFavorites, car];
    }

    localStorage.setItem(
      "favoriteCars",
      JSON.stringify(updatedFavorites)
    );

    setFavorites(
      updatedFavorites.map((favoriteCar) => favoriteCar.id)
    );
  };

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
                      className={`favorite-button ${
                        favorites.includes(car.id)
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleFavorite(car)
                      }
                      aria-label={
                        favorites.includes(car.id)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Heart
                        size={19}
                        fill={
                          favorites.includes(car.id)
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