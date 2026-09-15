
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

import Navbar from "../../components/navbar/Navbar";

import "./MyRental.css";

const rentalData = [
  {
    id: "RNT-2026-001",
    carId: 1,
    name: "BMW 3 Series",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80",
    location: "Mumbai, Maharashtra",
    startDate: "18 Sep 2026",
    endDate: "22 Sep 2026",
    duration: "4 Days",
    price: "₹24,000",
    status: "Upcoming",
    payment: "Paid",
  },
  {
    id: "RNT-2026-002",
    carId: 2,
    name: "Mercedes-Benz C-Class",
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80",
    location: "Navi Mumbai, Maharashtra",
    startDate: "10 Sep 2026",
    endDate: "14 Sep 2026",
    duration: "4 Days",
    price: "₹32,000",
    status: "Completed",
    payment: "Paid",
  },
  {
    id: "RNT-2026-003",
    carId: 3,
    name: "Audi A6",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=80",
    location: "Thane, Maharashtra",
    startDate: "02 Sep 2026",
    endDate: "05 Sep 2026",
    duration: "3 Days",
    price: "₹27,000",
    status: "Completed",
    payment: "Paid",
  },
];

function MyRentals() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Upcoming", "Completed"];

  const filteredRentals = rentalData.filter((rental) => {
    const matchesSearch =
      rental.name.toLowerCase().includes(search.toLowerCase()) ||
      rental.id.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "All" || rental.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const upcomingCount = rentalData.filter(
    (rental) => rental.status === "Upcoming"
  ).length;

  const completedCount = rentalData.filter(
    (rental) => rental.status === "Completed"
  ).length;

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
                <strong>{rentalData.length}</strong>
              </div>
            </div>

            <div className="rental-stat-card">
              <div className="rental-stat-icon">
                <Clock3 size={21} />
              </div>

              <div>
                <span>Upcoming</span>
                <strong>{upcomingCount}</strong>
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
                <strong>₹83,000</strong>
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

            {filteredRentals.length > 0 ? (

              <div className="rental-cards">

                {filteredRentals.map((rental) => (

                  <article className="rental-card" key={rental.id}>

                    {/* IMAGE */}

                    <div className="rental-image">

                      <img
                        src={rental.image}
                        alt={rental.name}
                      />

                      <span
                        className={`rental-status ${rental.status.toLowerCase()}`}
                      >
                        {rental.status === "Upcoming" ? (
                          <Clock3 size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
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
                          <strong className="rental-payment">
                            <CheckCircle2 size={14} />
                            {rental.payment}
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

                        {rental.status === "Upcoming" && (
                          <button
                            className="rental-manage-button"
                            onClick={() =>
                              alert(
                                `Managing rental ${rental.id}`
                              )
                            }
                          >
                            <Clock3 size={17} />
                            Manage Rental
                          </button>
                        )}

                        {rental.status === "Completed" && (
                          <button
                            className="rental-document-button"
                            onClick={() =>
                              alert(
                                `Rental receipt for ${rental.id}`
                              )
                            }
                          >
                            <CheckCircle2 size={17} />
                            View Receipt
                          </button>
                        )}

                        <button
                          className="rental-car-button"
                          onClick={() =>
                            navigate(`/buy/${rental.carId}`)
                          }
                        >
                          View Car
                          <ChevronRight size={17} />
                        </button>

                      </div>

                    </div>

                  </article>

                ))}

              </div>

            ) : (

              <div className="rentals-empty">

                <div className="rentals-empty-icon">
                  <AlertCircle size={32} />
                </div>

                <h3>No rentals found</h3>

                <p>
                  We couldn't find any rentals matching your search
                  or selected filter.
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