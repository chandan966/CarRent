
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Fuel,
  Gauge,
  Users,
  Heart,
  Calendar,
} from "lucide-react";

import Navbar from "../../components/navbar/Navbar";
import "./BuyDetails.css";

const cars = [
  {
    id: 1,
    name: "BMW 3 Series",
    brand: "BMW",
    year: 2023,
    price: 4200000,
    priceLabel: "₹42.00 Lakh",
    location: "Mumbai, Maharashtra",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    mileage: "14.8 km/l",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    badge: "Featured",
  },
  {
    id: 2,
    name: "Mercedes-Benz C-Class",
    brand: "Mercedes-Benz",
    year: 2023,
    price: 5800000,
    priceLabel: "₹58.00 Lakh",
    location: "Pune, Maharashtra",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    mileage: "16.9 km/l",
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
    badge: "Premium",
  },
  {
    id: 3,
    name: "Audi A6",
    brand: "Audi",
    year: 2022,
    price: 4800000,
    priceLabel: "₹48.00 Lakh",
    location: "Thane, Maharashtra",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    mileage: "15.2 km/l",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
    badge: "Popular",
  },
  {
    id: 4,
    name: "BMW X5",
    brand: "BMW",
    year: 2024,
    price: 9500000,
    priceLabel: "₹95.00 Lakh",
    location: "Mumbai, Maharashtra",
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 5,
    mileage: "12.4 km/l",
    image:
      "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1200&q=80",
    badge: "New",
  },
  {
    id: 5,
    name: "Mercedes-Benz GLC",
    brand: "Mercedes-Benz",
    year: 2023,
    price: 7200000,
    priceLabel: "₹72.00 Lakh",
    location: "Navi Mumbai, Maharashtra",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    mileage: "14.1 km/l",
    image:
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
    badge: "Luxury",
  },
  {
    id: 6,
    name: "Audi Q7",
    brand: "Audi",
    year: 2023,
    price: 8500000,
    priceLabel: "₹85.00 Lakh",
    location: "Pune, Maharashtra",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 7,
    mileage: "11.8 km/l",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
    badge: "Premium",
  },
];

function BuyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const car = cars.find((item) => item.id === Number(id));

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!car) return;

    const savedFavorites = localStorage.getItem("favoriteCars");

    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);

        const alreadyFavorite = favorites.some(
          (favorite) => favorite.id === car.id
        );

        setIsFavorite(alreadyFavorite);
      } catch (error) {
        console.error("Error reading favorites:", error);
        setIsFavorite(false);
      }
    }
  }, [car]);

  const toggleFavorite = () => {
    if (!car) return;

    const savedFavorites = localStorage.getItem("favoriteCars");

    let favorites = [];

    if (savedFavorites) {
      try {
        favorites = JSON.parse(savedFavorites);
      } catch (error) {
        console.error("Error reading favorites:", error);
        favorites = [];
      }
    }

    const alreadyFavorite = favorites.some(
      (favorite) => favorite.id === car.id
    );

    if (alreadyFavorite) {
      favorites = favorites.filter(
        (favorite) => favorite.id !== car.id
      );

      setIsFavorite(false);
    } else {
      const favoriteCar = {
        id: car.id,
        name: car.name,
        year: car.year,
        price: car.priceLabel,
        location: car.location,
        fuel: car.fuel,
        transmission: car.transmission,
        mileage: car.mileage,
        image: car.image,
      };

      favorites.push(favoriteCar);

      setIsFavorite(true);
    }

    localStorage.setItem(
      "favoriteCars",
      JSON.stringify(favorites)
    );
  };

  if (!car) {
    return (
      <>
        <Navbar />

        <main className="buy-details-page">
          <div className="buy-details-not-found">
            <h1>Car Not Found</h1>

            <p>
              The car you are looking for is not available.
            </p>

            <button onClick={() => navigate("/buy")}>
              Back to Buy Cars
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="buy-details-page">
        <div className="buy-details-container">

          <button
            className="buy-details-back"
            onClick={() => navigate("/buy")}
          >
            <ArrowLeft size={18} />
            Back to Buy
          </button>

          <div className="buy-details-grid">

            <div className="buy-details-image-section">
              <div className="buy-details-image-wrapper">

                <img
                  src={car.image}
                  alt={car.name}
                  className="buy-details-image"
                />

                <span className="buy-details-badge">
                  {car.badge}
                </span>

                <button
                  className={`buy-details-favorite ${
                    isFavorite ? "active" : ""
                  }`}
                  onClick={toggleFavorite}
                  aria-label={
                    isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                  title={
                    isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Heart
                    size={21}
                    fill={
                      isFavorite
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>

              </div>
            </div>

            <div className="buy-details-content">

              <span className="buy-details-eyebrow">
                {car.brand}
              </span>

              <h1>{car.name}</h1>

              <div className="buy-details-location">
                <MapPin size={18} />
                <span>{car.location}</span>
              </div>

              <div className="buy-details-price">
                {car.priceLabel}
              </div>

              <p className="buy-details-description">
                Experience premium comfort, advanced technology and
                impressive performance with the {car.name}. This vehicle
                is available for purchase and is ready for its next owner.
              </p>

              <div className="buy-details-specs">

                <div className="buy-details-spec">
                  <Calendar size={21} />

                  <div>
                    <span>Year</span>
                    <strong>{car.year}</strong>
                  </div>
                </div>

                <div className="buy-details-spec">
                  <Fuel size={21} />

                  <div>
                    <span>Fuel</span>
                    <strong>{car.fuel}</strong>
                  </div>
                </div>

                <div className="buy-details-spec">
                  <Gauge size={21} />

                  <div>
                    <span>Mileage</span>
                    <strong>{car.mileage}</strong>
                  </div>
                </div>

                <div className="buy-details-spec">
                  <Users size={21} />

                  <div>
                    <span>Seats</span>
                    <strong>{car.seats}</strong>
                  </div>
                </div>

              </div>

              <div className="buy-details-actions">

                <button
                  className="buy-details-primary"
                  onClick={() =>
                    navigate(
                      `/booking?car=${car.id}&type=buy`
                    )
                  }
                >
                  Buy This Car
                </button>

                <button className="buy-details-secondary">
                  Contact Seller
                </button>

              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default BuyDetails;