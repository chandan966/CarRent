import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { useCars } from "../../context/CarsContext";
import "./RentDetails.css";


const RentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { rentalCars } = useCars();
  const pickupDate = searchParams.get("pickup") || "";
  const returnDate = searchParams.get("return") || "";

  const car = rentalCars.find((item) => String(item.id) === id);

  if (!car) {
    return (
      <div className="rent-detail-not-found">
        <h2>Car Not Found</h2>

        <button onClick={() => navigate("/rent")}>
          Back to Rental Cars
        </button>
      </div>
    );
  }

  const handleRentNow = () => {
    const duration = pickupDate && returnDate
      ? Math.max(1, Math.ceil((new Date(`${returnDate}T00:00:00`) - new Date(`${pickupDate}T00:00:00`)) / 86400000))
      : 1;
    const params = new URLSearchParams({ car: String(car.id), type: "rent" });
    if (pickupDate) params.set("startDate", pickupDate);
    if (pickupDate && returnDate) params.set("days", String(duration));
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <div className="rent-detail-page">
      <Navbar />

      <main className="rent-detail-container">

        <button
          className="rent-detail-back"
          onClick={() => navigate("/rent")}
        >
          ← Back to Rental Cars
        </button>

        <div className="rent-detail-card">

          <div className="rent-detail-image-section">
            <img
              src={car.image}
              alt={car.name}
              className="rent-detail-image"
            />

            <span className="rent-detail-badge">
              {car.badge}
            </span>
          </div>

          <div className="rent-detail-content">

            <p className="rent-detail-brand">
              {car.brand}
            </p>

            <h1>{car.name}</h1>

            <p className="rent-detail-year">
              {car.year} Model
            </p>

            <div className="rent-detail-price">
              {car.priceLabel}
            </div>

            <p className="rent-detail-location">
              📍 {car.location}
            </p>

            <div className="rent-detail-specs">

              <div>
                <strong>Fuel</strong>
                <span>{car.fuel}</span>
              </div>

              <div>
                <strong>Transmission</strong>
                <span>{car.transmission}</span>
              </div>

              <div>
                <strong>Seats</strong>
                <span>{car.seats}</span>
              </div>

              <div>
                <strong>Mileage</strong>
                <span>{car.mileage}</span>
              </div>

            </div>

            <div className="rent-detail-actions">

              <button
                className="rent-detail-rent-button"
                onClick={handleRentNow}
              >
                Rent Now →
              </button>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default RentDetail;
