import './Booking.css';
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Navbar from "../../components/navbar/Navbar";
import BookingForm from "../../components/booking/BookingForm";
import BookingSummary from "../../components/booking/BookingSummary";

import "./Booking.css";

const cars = [
  {
    id: 1,
    name: "BMW 3 Series",
    price: 4200000,
    priceLabel: "₹42.00 Lakh",
  },
  {
    id: 2,
    name: "Mercedes-Benz C-Class",
    price: 5800000,
    priceLabel: "₹58.00 Lakh",
  },
  {
    id: 3,
    name: "Audi A6",
    price: 4800000,
    priceLabel: "₹48.00 Lakh",
  },
  {
    id: 4,
    name: "BMW X5",
    price: 9500000,
    priceLabel: "₹95.00 Lakh",
  },
  {
    id: 5,
    name: "Mercedes-Benz GLC",
    price: 7200000,
    priceLabel: "₹72.00 Lakh",
  },
  {
    id: 6,
    name: "Audi Q7",
    price: 8500000,
    priceLabel: "₹85.00 Lakh",
  },
];

function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const carId = Number(searchParams.get("car"));
  const type = searchParams.get("type") || "buy";

  const selectedCar = cars.find((car) => car.id === carId);

  if (!selectedCar) {
    return (
      <>
        <Navbar />

        <main className="booking-page">
          <div className="booking-not-found">
            <h1>Car Not Found</h1>
            <p>
              We could not find the car you selected for booking.
            </p>

            <button onClick={() => navigate("/buy")}>
              Back to Buy
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="booking-page">
        <div className="booking-container">

          <button
            className="booking-back-button"
            onClick={() => navigate(`/buy/${selectedCar.id}`)}
          >
            <ArrowLeft size={18} />
            Back to Car Details
          </button>

          <div className="booking-header">
            <span>BOOKING</span>

            <h1>
              {type === "rent"
                ? "Rent This Car"
                : "Buy This Car"}
            </h1>

            <p>
              Complete the details below to continue with your
              {type === "rent" ? " rental." : " purchase."}
            </p>
          </div>

          <div className="booking-layout">

            <section className="booking-form-section">
              <BookingForm
                car={selectedCar}
                type={type}
              />
            </section>

            <aside className="booking-summary-section">
              <BookingSummary
                car={selectedCar}
                type={type}
              />
            </aside>

          </div>
        </div>
      </main>
    </>
  );
}

export default Booking;