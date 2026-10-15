import './Booking.css';
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Navbar from "../../components/Navbar/Navbar";
import BookingForm from "../../components/booking/BookingForm";
import BookingSummary from "../../components/booking/BookingSummary";
import { useCars } from "../../context/CarsContext";

function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const carId = searchParams.get("car") || "";
  const type = searchParams.get("type") === "rent" ? "rent" : "buy";
  const startDate = searchParams.get("startDate") || "";
  const days = Number(searchParams.get("days")) || 1;
  const [summaryStartDate, setSummaryStartDate] = useState(startDate);
  const [summaryDays, setSummaryDays] = useState(days);

  const { buyCars, rentalCars } = useCars();
  const selectedCar = (type === "rent" ? rentalCars : buyCars)
    .find((car) => String(car.id) === carId);

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

            <button onClick={() => navigate(type === "rent" ? "/rent" : "/buy")}>
              Back to {type === "rent" ? "Rentals" : "Buy"}
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
            onClick={() => navigate(type === "rent" ? `/car/${selectedCar.id}?type=rent` : `/buy/${selectedCar.id}`)}
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
                startDate={startDate}
                days={days}
                onStartDateChange={setSummaryStartDate}
                onDaysChange={setSummaryDays}
              />
            </section>

            <aside className="booking-summary-section">
              <BookingSummary
                car={selectedCar}
                type={type}
                startDate={summaryStartDate}
                days={summaryDays}
              />
            </aside>

          </div>
        </div>
      </main>
    </>
  );
}

export default Booking;
