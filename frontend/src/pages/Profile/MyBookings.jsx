import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  ChevronRight,
  ClipboardList,
  Clock3,
} from "lucide-react";

import Navbar from "../../components/Navbar/Navbar";
import { getBookingHistory } from "../../utils/bookingStorage";
import "./MyBookings.css";

function formatBookingDate(value) {
  if (!value) return "Date not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function MyBookings() {
  const navigate = useNavigate();
  const [bookings] = useState(getBookingHistory);

  return (
    <>
      <Navbar />
      <main className="my-bookings-page">
        <div className="my-bookings-container">
          <button
            className="my-bookings-back"
            type="button"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft size={17} />
            Back to Profile
          </button>

          <header className="my-bookings-header">
            <div className="my-bookings-icon">
              <ClipboardList size={25} />
            </div>
            <div>
              <span>YOUR ACTIVITY</span>
              <h1>My Bookings</h1>
              <p>{bookings.length} booking requests saved</p>
            </div>
          </header>

          {bookings.length === 0 ? (
            <section className="my-bookings-empty">
              <CarFront size={38} />
              <h2>No bookings yet</h2>
              <p>When you submit a purchase or rental request, it will show here.</p>
              <button type="button" onClick={() => navigate("/cars")}>
                Browse Cars
                <ChevronRight size={17} />
              </button>
            </section>
          ) : (
            <section className="my-bookings-list">
              {bookings.map((booking, index) => (
                <article
                  className="my-booking-card"
                  key={booking.id || booking.createdAt || `${booking.carId}-${index}`}
                >
                  <div className="my-booking-car-icon">
                    <CarFront size={22} />
                  </div>
                  <div className="my-booking-main">
                    <div className="my-booking-title-row">
                      <h2>{booking.carName || "Car booking"}</h2>
                      <span className="my-booking-status">Request submitted</span>
                    </div>
                    <p>
                      {booking.bookingType === "rent"
                        ? "Rental request"
                        : "Purchase request"}
                      {booking.id ? ` · ${booking.id}` : ""}
                    </p>
                    <div className="my-booking-meta">
                      <span>
                        <CalendarDays size={15} />
                        {booking.startDate || formatBookingDate(booking.createdAt)}
                      </span>
                      <span>
                        <Clock3 size={15} />
                        {booking.days ? `${booking.days} days` : "Submitted"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default MyBookings;
