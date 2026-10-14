import {
  ArrowLeft,
  Fuel,
  Gauge,
  Heart,
  MapPin,
  Settings2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import { useFavorites } from "../../hooks/useFavorites";
import { carsData } from "./Cars";
import "./CarsDetails.css";

function CarsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const car = carsData.find((item) => item.id === Number(id));
  const favorite = isFavorite(car, "buy");

  return (
    <>
      <Navbar />
      <main className="cars-details-page">
        {car ? (
          <div className="cars-details-container">
            <button
              className="cars-details-back"
              type="button"
              onClick={() => navigate("/cars")}
            >
              <ArrowLeft size={17} />
              Back to Cars
            </button>

            <section className="cars-details-card">
              <div className="cars-details-image-wrap">
                <img src={car.image} alt={car.name} />
                <span className="cars-details-type">{car.type}</span>
                <button
                  className={`cars-details-heart ${favorite ? "active" : ""}`}
                  type="button"
                  onClick={() =>
                    toggleFavorite({ ...car, detailRoute: "/cars" }, "buy")
                  }
                  aria-label={
                    favorite
                      ? `Remove ${car.name} from favorites`
                      : `Add ${car.name} to favorites`
                  }
                  aria-pressed={favorite}
                >
                  <Heart size={21} fill={favorite ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="cars-details-content">
                <span className="cars-details-eyebrow">CAR DETAILS</span>
                <h1>{car.name}</h1>
                <p className="cars-details-subtitle">
                  {car.year} model · {car.type}
                </p>

                <div className="cars-details-price">{car.price}</div>

                <div className="cars-details-specs">
                  <div>
                    <Fuel size={19} />
                    <span>Fuel</span>
                    <strong>{car.fuel}</strong>
                  </div>
                  <div>
                    <Gauge size={19} />
                    <span>Mileage</span>
                    <strong>{car.mileage}</strong>
                  </div>
                  <div>
                    <Settings2 size={19} />
                    <span>Transmission</span>
                    <strong>{car.transmission}</strong>
                  </div>
                  <div>
                    <MapPin size={19} />
                    <span>Location</span>
                    <strong>{car.location}</strong>
                  </div>
                </div>

                <p className="cars-details-note">
                  Review the vehicle information above. You can return to the
                  cars list whenever you are ready to compare another vehicle.
                </p>
                <div className="cars-details-actions">
                  <button
                    className="cars-details-buy"
                    type="button"
                    onClick={() => navigate("/buy")}
                  >
                    Buy Cars
                  </button>
                  <button
                    className="cars-details-all"
                    type="button"
                    onClick={() => navigate("/cars")}
                  >
                    All Cars
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="cars-details-not-found">
            <h1>Car not found</h1>
            <p>This car may no longer be available.</p>
            <button type="button" onClick={() => navigate("/cars")}>
              Return to Cars
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default CarsDetails;
