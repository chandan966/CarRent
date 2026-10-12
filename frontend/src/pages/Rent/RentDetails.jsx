import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./RentDetails.css";

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

const RentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const car = rentalCars.find((item) => item.id === Number(id));

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
    navigate(`/booking?carId=${car.id}&type=rent`);
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