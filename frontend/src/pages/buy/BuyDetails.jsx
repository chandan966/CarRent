
import { useState } from "react";
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

import Navbar from "../../components/Navbar/Navbar";
import ContactSeller from "./ContactSeller";
import { useFavorites } from "../../hooks/useFavorites";
import { buyCars as cars } from "../../data/cars";
import "./BuyDetails.css";


function BuyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const car = cars.find((item) => item.id === Number(id));
  const [selectedSellerCar, setSelectedSellerCar] = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(car, "buy");

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
                    favorite ? "active" : ""
                  }`}
                  onClick={() => toggleFavorite(car, "buy")}
                  aria-label={
                    favorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                  title={
                    favorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Heart
                    size={21}
                    fill={
                      favorite
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

                <button
                  className="buy-details-secondary"
                  onClick={() => setSelectedSellerCar(car)}
                >
                  Contact Seller
                </button>

              </div>

            </div>
          </div>
        </div>
      </main>

      <ContactSeller
        car={selectedSellerCar}
        onClose={() => setSelectedSellerCar(null)}
      />
    </>
  );
}

export default BuyDetails;
