import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { createBooking } from "../../Services/bookingServices";
import "./BookingForm.css";

function BookingForm({ car, type, startDate: initialStartDate = "", days: initialDays = 1, onStartDateChange, onDaysChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      const savedBooking = await createBooking({
        carId: car.id,
        bookingType: type,
        fullName: String(form.get("fullName") || "").trim(),
        mobile: String(form.get("mobile") || "").trim(),
        ...(type === "rent" && {
          startDate: form.get("startDate"),
          days: Number(form.get("days")),
          pickupLocation: String(form.get("pickupLocation") || "").trim(),
        }),
      });
      setBooking(savedBooking);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (booking) {
    return (
      <section className="booking-success" role="status">
        <CheckCircle2 size={40} />
        <h2>Request received</h2>
        <p>Your request <strong>{booking.id}</strong> is saved to your account.</p>
        <button type="button" onClick={() => navigate("/my-bookings")}>View My Bookings</button>
      </section>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <section className="booking-section">
        <div className="booking-section-header">
          <span>01</span>
          <div>
            <h2>Contact details</h2>
            <p>We’ll use these details to follow up on your request.</p>
          </div>
        </div>

        <div className="booking-grid">
          <label>
            Full name *
            <input name="fullName" type="text" defaultValue={user?.fullName || ""} minLength={2} maxLength={100} autoComplete="name" required />
          </label>
          <label>
            Account email
            <input type="email" value={user?.email || ""} autoComplete="email" disabled readOnly />
          </label>
          <label>
            Phone number *
            <input name="mobile" type="tel" defaultValue={user?.phone || ""} placeholder="10-digit number" pattern="\+?[0-9 ()-]{7,20}" maxLength={20} autoComplete="tel" required />
          </label>
        </div>
      </section>

      {type === "rent" && (
        <section className="booking-section">
          <div className="booking-section-header">
            <span>02</span>
            <div>
              <h2>Rental details</h2>
              <p>Choose a start date and rental duration.</p>
            </div>
          </div>
          <div className="booking-grid">
            <label>
              Pickup date *
              <input name="startDate" type="date" defaultValue={initialStartDate} min={today} onChange={(event) => onStartDateChange?.(event.target.value)} required />
            </label>
            <label>
              Duration (days) *
              <input name="days" type="number" min="1" max="90" defaultValue={initialDays} onChange={(event) => onDaysChange?.(Math.min(90, Math.max(1, Number(event.target.value) || 1)))} required />
            </label>
            <label>
              Pickup location
              <input name="pickupLocation" type="text" defaultValue={car.location || ""} maxLength={120} />
            </label>
          </div>
        </section>
      )}

      <section className="booking-section booking-confirmation">
        <div className="booking-section-header">
          <span>{type === "rent" ? "03" : "02"}</span>
          <div>
            <h2>Submit request</h2>
            <p>This creates a request. No payment is taken on this demo site.</p>
          </div>
        </div>
        <label className="agreement">
          <input type="checkbox" required />
          <span>I confirm the contact details above are correct.</span>
        </label>
        {error && <p className="booking-error" role="alert">{error}</p>}
        <button className="booking-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : `Submit ${type === "rent" ? "rental" : "purchase"} request`}
        </button>
      </section>
    </form>
  );
}

export default BookingForm;
