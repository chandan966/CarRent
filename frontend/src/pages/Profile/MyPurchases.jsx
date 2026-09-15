
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CarFront,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  CalendarDays,
  IndianRupee,
  ChevronRight,
  Search,
} from "lucide-react";

import Navbar from "../../components/navbar/Navbar";

import "./MyPurchases.css";

const purchaseData = [
  {
    id: "PUR-2026-001",
    carId: 1,
    name: "BMW 3 Series",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",
    price: "₹42.00 Lakh",
    location: "Mumbai, Maharashtra",
    date: "12 Sep 2026",
    status: "Completed",
    payment: "Paid",
  },
  {
    id: "PUR-2026-002",
    carId: 2,
    name: "Mercedes-Benz C-Class",
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80",
    price: "₹58.00 Lakh",
    location: "Navi Mumbai, Maharashtra",
    date: "28 Aug 2026",
    status: "Processing",
    payment: "Paid",
  },
  {
    id: "PUR-2026-003",
    carId: 3,
    name: "Audi A6",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
    price: "₹48.00 Lakh",
    location: "Thane, Maharashtra",
    date: "15 Jul 2026",
    status: "Completed",
    payment: "Paid",
  },
];

function MyPurchases() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Completed", "Processing"];

  const filteredPurchases = purchaseData.filter((purchase) => {
    const matchesSearch =
      purchase.name.toLowerCase().includes(search.toLowerCase()) ||
      purchase.id.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "All" || purchase.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <Navbar />

      <main className="purchases-page">
        <div className="purchases-container">
          <button
            className="purchases-back"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft size={18} />
            Back to Profile
          </button>

          <section className="purchases-hero">
            <div>
              <span className="purchases-eyebrow">MY PURCHASES</span>

              <h1>Purchase History</h1>

              <p>
                View your purchased vehicles, payment status and transaction
                details in one place.
              </p>
            </div>

            <div className="purchases-hero-icon">
              <CarFront size={42} />
            </div>
          </section>

          <section className="purchase-stats">
            <div className="purchase-stat-card">
              <div className="purchase-stat-icon">
                <CarFront size={21} />
              </div>

              <div>
                <span>Total Purchases</span>
                <strong>{purchaseData.length}</strong>
              </div>
            </div>

            <div className="purchase-stat-card">
              <div className="purchase-stat-icon">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Completed</span>
                <strong>
                  {purchaseData.filter(
                    (purchase) => purchase.status === "Completed"
                  ).length}
                </strong>
              </div>
            </div>

            <div className="purchase-stat-card">
              <div className="purchase-stat-icon">
                <Clock3 size={21} />
              </div>

              <div>
                <span>Processing</span>
                <strong>
                  {purchaseData.filter(
                    (purchase) => purchase.status === "Processing"
                  ).length}
                </strong>
              </div>
            </div>

            <div className="purchase-stat-card">
              <div className="purchase-stat-icon">
                <IndianRupee size={21} />
              </div>

              <div>
                <span>Total Value</span>
                <strong>₹1.48 Cr</strong>
              </div>
            </div>
          </section>

          <section className="purchases-toolbar">
            <div className="purchase-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search by car or purchase ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="purchase-filters">
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

          <section className="purchases-list">
            <div className="purchases-list-header">
              <div>
                <span className="section-label">TRANSACTIONS</span>
                <h2>Your Purchased Cars</h2>
              </div>

              <span className="purchase-count">
                {filteredPurchases.length}{" "}
                {filteredPurchases.length === 1 ? "Purchase" : "Purchases"}
              </span>
            </div>

            {filteredPurchases.length > 0 ? (
              <div className="purchase-cards">
                {filteredPurchases.map((purchase) => (
                  <article className="purchase-card" key={purchase.id}>
                    <div className="purchase-image">
                      <img src={purchase.image} alt={purchase.name} />

                      <span
                        className={`purchase-status ${purchase.status.toLowerCase()}`}
                      >
                        {purchase.status === "Completed" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Clock3 size={14} />
                        )}

                        {purchase.status}
                      </span>
                    </div>

                    <div className="purchase-content">
                      <div className="purchase-main">
                        <span className="purchase-type">CAR PURCHASE</span>

                        <h3>{purchase.name}</h3>

                        <div className="purchase-location">
                          <MapPin size={15} />
                          {purchase.location}
                        </div>
                      </div>

                      <div className="purchase-details">
                        <div>
                          <span>Purchase ID</span>
                          <strong>{purchase.id}</strong>
                        </div>

                        <div>
                          <span>Purchase Date</span>
                          <strong>
                            <CalendarDays size={14} />
                            {purchase.date}
                          </strong>
                        </div>

                        <div>
                          <span>Payment</span>
                          <strong className="payment-paid">
                            <CheckCircle2 size={14} />
                            {purchase.payment}
                          </strong>
                        </div>

                        <div>
                          <span>Amount</span>
                          <strong className="purchase-price">
                            {purchase.price}
                          </strong>
                        </div>
                      </div>

                      <div className="purchase-actions">
                        <button
                          className="purchase-document-button"
                          onClick={() =>
                            alert(
                              `Invoice for ${purchase.name} (${purchase.id})`
                            )
                          }
                        >
                          <FileText size={17} />
                          View Invoice
                        </button>

                        <button
                          className="purchase-details-button"
                          onClick={() => navigate(`/buy/${purchase.carId}`)}
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
              <div className="purchases-empty">
                <div className="purchases-empty-icon">
                  <CarFront size={32} />
                </div>

                <h3>No purchases found</h3>

                <p>
                  We couldn't find any purchases matching your search or
                  selected filter.
                </p>

                <button onClick={() => navigate("/buy")}>
                  Browse Cars
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

export default MyPurchases;