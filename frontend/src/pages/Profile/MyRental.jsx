
import { useState } from "react";
import { getRentalHistory } from "../../utils/bookingStorage";
import { useBookings } from "../../hooks/useBookings";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { createPaymentOrder, verifyPayment } from "../../Services/paymentServices";
import { loadRazorpayCheckout } from "../../Services/razorpayCheckout";
import {
  ArrowLeft,
  CarFront,
  CalendarDays,
  Clock3,
  MapPin,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Search,
} from "lucide-react";

import Navbar from "../../components/Navbar/Navbar";

import "./MyRental.css";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function MyRentals() {
  const { bookings, isLoading, error } = useBookings();
  const rentals = getRentalHistory(bookings);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [payingRentalId, setPayingRentalId] = useState("");
  const [paidRentalIds, setPaidRentalIds] = useState(() => new Set());
  const [paymentError, setPaymentError] = useState("");

  const filters = ["All", "Pending", "Upcoming", "Completed"];

  const filteredRentals = rentals.filter((rental) => {
    const matchesSearch =
      rental.name.toLowerCase().includes(search.toLowerCase()) ||
      rental.id.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "All" || rental.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const pendingCount = rentals.filter((rental) => rental.status === "Pending").length;
  const completedCount = rentals.filter((rental) => rental.status === "Completed").length;
  const totalSpent = rentals.reduce((total, rental) => total + (rental.payment === "Paid" ? rental.amount : 0), 0);

  const handlePayNow = async (rental) => {
    setPaymentError("");
    setPayingRentalId(rental.id);
    try {
      await loadRazorpayCheckout();
      const order = await createPaymentOrder(rental.id);
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "CarRent",
        description: `${rental.name} rental`,
        order_id: order.orderId,
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#0284c7" },
        handler: async (paymentResponse) => {
          try {
            await verifyPayment(rental.id, paymentResponse);
            setPaidRentalIds((current) => new Set(current).add(rental.id));
          } catch {
            setPaymentError("Payment was submitted, but confirmation could not be verified. Do not pay again; refresh the page or contact support.");
          } finally {
            setPayingRentalId("");
          }
        },
        modal: {
          ondismiss: () => setPayingRentalId(""),
        },
      });
      checkout.on("payment.failed", (event) => {
        setPaymentError(event.error?.description || "Payment failed. Please try again.");
        setPayingRentalId("");
      });
      checkout.open();
    } catch (error) {
      setPaymentError(error.message || "Could not start payment. Please try again.");
      setPayingRentalId("");
    }
  };

  return (
    <>
      <Navbar />

      <main className="rentals-page">
        <div className="rentals-container">

          {/* BACK */}

          <button
            className="rentals-back"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft size={18} />
            Back to Profile
          </button>

          {/* HERO */}

          <section className="rentals-hero">
            <div>
              <span className="rentals-eyebrow">MY RENTALS</span>

              <h1>Rental History</h1>

              <p>
                Manage your upcoming trips, view previous rentals and keep
                track of all your vehicle rental bookings.
              </p>
            </div>

            <div className="rentals-hero-icon">
              <CarFront size={42} />
            </div>
          </section>

          {/* STATS */}

          <section className="rental-stats">

            <div className="rental-stat-card">
              <div className="rental-stat-icon">
                <CarFront size={21} />
              </div>

              <div>
                <span>Total Rentals</span>
                <strong>{rentals.length}</strong>
              </div>
            </div>

            <div className="rental-stat-card">
              <div className="rental-stat-icon">
                <Clock3 size={21} />
              </div>

              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>

            <div className="rental-stat-card">
              <div className="rental-stat-icon">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </div>
            </div>

            <div className="rental-stat-card">
              <div className="rental-stat-icon">
                <IndianRupee size={21} />
              </div>

              <div>
                <span>Total Spent</span>
                <strong>{formatCurrency(totalSpent)}</strong>
              </div>
            </div>

          </section>

          {/* TOOLBAR */}

          <section className="rentals-toolbar">

            <div className="rental-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search by car or rental ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="rental-filters">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={activeFilter === filter ? "active" : ""}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

          </section>

          {/* RENTAL LIST */}

          <section className="rentals-list">

            <div className="rentals-list-header">
              <div>
                <span className="rental-section-label">
                  RENTAL BOOKINGS
                </span>

                <h2>Your Rental Cars</h2>
              </div>

              <span className="rental-count">
                {filteredRentals.length}{" "}
                {filteredRentals.length === 1 ? "Rental" : "Rentals"}
              </span>
            </div>

            {isLoading ? (
              <div className="rentals-empty" role="status">Loading your rental requests…</div>
            ) : error ? (
              <div className="rentals-empty" role="alert">{error}</div>
            ) : filteredRentals.length > 0 ? (

              <div className="rental-cards">

                {paymentError && <p className="rental-payment-error" role="alert">{paymentError}</p>}
                {filteredRentals.map((rental) => {
                  const payment = paidRentalIds.has(rental.id) ? "Paid" : rental.payment;
                  const isPaid = payment.toLowerCase() === "paid";
                  const canPay = ["Pending", "Confirmed"].includes(rental.bookingStatus);
                  return (
                    <article className="rental-card" key={rental.id}>

                    {/* IMAGE */}

                    <div className="rental-image">

                      {rental.image ? (
                        <img src={rental.image} alt={rental.name} />
                      ) : (
                        <div className="rental-image-placeholder" aria-hidden="true">
                          <CarFront size={42} />
                        </div>
                      )}

                      <span
                        className={`rental-status ${rental.status.toLowerCase()}`}
                      >
                        {rental.status === "Completed" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Clock3 size={14} />
                        )}

                        {rental.status}
                      </span>

                    </div>

                    {/* CONTENT */}

                    <div className="rental-content">

                      <div className="rental-main">

                        <span className="rental-type">
                          CAR RENTAL
                        </span>

                        <h3>{rental.name}</h3>

                        <div className="rental-location">
                          <MapPin size={15} />
                          {rental.location}
                        </div>

                      </div>

                      {/* RENTAL DETAILS */}

                      <div className="rental-details">

                        <div>
                          <span>Rental ID</span>
                          <strong>{rental.id}</strong>
                        </div>

                        <div>
                          <span>Start Date</span>
                          <strong>
                            <CalendarDays size={14} />
                            {rental.startDate}
                          </strong>
                        </div>

                        <div>
                          <span>Return Date</span>
                          <strong>
                            <CalendarDays size={14} />
                            {rental.endDate}
                          </strong>
                        </div>

                        <div>
                          <span>Duration</span>
                          <strong>{rental.duration}</strong>
                        </div>

                        <div>
                          <span>Payment</span>
                          <strong className={"rental-payment " + (isPaid ? "paid" : "pending")}>
                            {isPaid ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                            {payment}
                          </strong>
                        </div>

                        <div>
                          <span>Total Amount</span>
                          <strong className="rental-price">
                            {rental.price}
                          </strong>
                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="rental-actions">
                        <button
                          className="rental-pay-button"
                          type="button"
                          onClick={() => handlePayNow(rental)}
                          disabled={isPaid || !canPay || payingRentalId === rental.id}
                          title={!isPaid && !canPay ? "Payment is unavailable for this rental." : undefined}
                        >
                          <IndianRupee size={16} />
                          {isPaid
                            ? "Paid"
                            : payingRentalId === rental.id
                              ? "Opening checkout…"
                              : canPay
                                ? "Pay Now"
                                : "Unavailable"}
                        </button>

                        {rental.status === "Upcoming" && (
                          <button
                            className="rental-manage-button"
                            type="button"
                            disabled
                            title="Rental management will be available when booking management is connected."
                          >
                            <Clock3 size={17} />
                            Manage Rental
                          </button>
                        )}

                        {rental.status === "Completed" && rental.payment === "Paid" && (
                          <button
                            className="rental-document-button"
                            type="button"
                            disabled
                            title="Receipts are not available until online payments are connected."
                          >
                            <CheckCircle2 size={17} />
                            View Receipt
                          </button>
                        )}

                        <button
                          className="rental-car-button"
                          onClick={() =>
                            navigate(`/car/${rental.carId}?type=rent`)
                          }
                        >
                          View Car
                          <ChevronRight size={17} />
                        </button>

                      </div>

                    </div>

                    </article>
                  );
                })}

              </div>

            ) : (

              <div className="rentals-empty">

                <div className="rentals-empty-icon">
                  <AlertCircle size={32} />
                </div>

                <h3>{rentals.length === 0 ? "No rental requests yet" : "No rentals found"}</h3>

                <p>
                  {rentals.length === 0
                    ? "Rental requests you submit will appear here."
                    : "We couldn't find rentals matching your search or filter."}
                </p>

                <button onClick={() => navigate("/rent")}>
                  Browse Rental Cars
                  <ChevronRight size={17} />
                </button>

              </div>

            )}

          </section>

        </div>
      </main>
    </>
  );
}

export default MyRentals;
