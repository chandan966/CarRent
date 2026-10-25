
import { useState } from "react";
import { getPurchaseHistory } from "../../utils/bookingStorage";
import { useBookings } from "../../hooks/useBookings";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CarFront,
  CheckCircle2,
  Clock3,
  FileText,
  X,
  Printer,
  MapPin,
  CalendarDays,
  IndianRupee,
  ChevronRight,
  Search,
  FileDown,
} from "lucide-react";

import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "../../context/useAuth";
import { createPaymentOrder, verifyPayment } from "../../Services/paymentServices";
import { loadRazorpayCheckout } from "../../Services/razorpayCheckout";

import "./MyPurchases.css";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

async function downloadPurchaseInvoice(invoice, user) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;

  pdf.setFillColor(16, 42, 54);
  pdf.rect(0, 0, pageWidth, 42, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("CARRENT", margin, 18);
  pdf.setFontSize(21);
  pdf.text("Purchase invoice", margin, 31);

  pdf.setTextColor(51, 65, 85);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Invoice number: INV-${invoice.id}`, margin, 56);
  pdf.text(`Purchase date: ${invoice.date}`, margin, 64);
  pdf.text(`Payment status: ${invoice.payment}`, pageWidth - margin, 56, { align: "right" });

  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, 74, pageWidth - margin, 74);
  pdf.setFont("helvetica", "bold");
  pdf.text("BILLED TO", margin, 86);
  pdf.text("VEHICLE", pageWidth / 2 + 5, 86);
  pdf.setFont("helvetica", "normal");
  let billedToY = 94;
  for (const value of [user?.fullName || "CarRent customer", user?.email, user?.phone]) {
    if (!value) continue;
    const lines = pdf.splitTextToSize(value, 75);
    pdf.text(lines, margin, billedToY);
    billedToY += lines.length * 5;
  }
  let vehicleY = 94;
  for (const value of [invoice.name, invoice.location]) {
    const lines = pdf.splitTextToSize(value, 75);
    pdf.text(lines, pageWidth / 2 + 5, vehicleY);
    vehicleY += lines.length * 5;
  }

  pdf.setFillColor(241, 245, 249);
  pdf.rect(margin, 124, pageWidth - margin * 2, 18, "F");
  pdf.setFont("helvetica", "bold");
  pdf.text("DESCRIPTION", margin + 5, 135);
  pdf.text("AMOUNT", pageWidth - margin - 5, 135, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.text(pdf.splitTextToSize(`${invoice.name} - Vehicle purchase`, 105), margin + 5, 153);
  pdf.text(invoice.price.replace(/[₹,]/g, "").trim() + " INR", pageWidth - margin - 5, 153, { align: "right" });
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, 163, pageWidth - margin, 163);
  pdf.setFont("helvetica", "bold");
  pdf.text(invoice.payment.toLowerCase() === "paid" ? "AMOUNT PAID" : "AMOUNT DUE", pageWidth - 80, 177);
  pdf.setFontSize(14);
  pdf.text(invoice.price.replace(/[₹,]/g, "").trim() + " INR", pageWidth - margin - 5, 177, { align: "right" });

  if (invoice.payment.toLowerCase() !== "paid") {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text("This is a purchase summary, not a payment receipt.", margin, 195);
  }

  pdf.save(`CarRent-Invoice-${String(invoice.id).replace(/[^a-zA-Z0-9-]/g, "")}.pdf`);
}

function MyPurchases() {
  const { bookings, isLoading, error } = useBookings();
  const purchases = getPurchaseHistory(bookings);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payingPurchaseId, setPayingPurchaseId] = useState("");
  const [paidPurchaseIds, setPaidPurchaseIds] = useState(() => new Set());
  const [paymentError, setPaymentError] = useState("");
  const [invoiceDownloadError, setInvoiceDownloadError] = useState("");
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  const filters = ["All", "Completed", "Processing"];
  const totalPurchaseValue = purchases.reduce((total, purchase) => total + purchase.amount, 0);

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.name.toLowerCase().includes(search.toLowerCase()) ||
      purchase.id.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "All" || purchase.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const handlePayNow = async (purchase) => {
    setPaymentError("");
    setPayingPurchaseId(purchase.id);
    try {
      await loadRazorpayCheckout();
      const order = await createPaymentOrder(purchase.id);
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "CarRent",
        description: purchase.name,
        order_id: order.orderId,
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#0284c7" },
        handler: async (paymentResponse) => {
          try {
            await verifyPayment(purchase.id, paymentResponse);
            setPaidPurchaseIds((current) => new Set(current).add(purchase.id));
          } catch {
            setPaymentError("Payment was submitted, but confirmation could not be verified. Do not pay again; refresh the page or contact support.");
          } finally {
            setPayingPurchaseId("");
          }
        },
        modal: {
          ondismiss: () => setPayingPurchaseId(""),
        },
      });
      checkout.on("payment.failed", (event) => {
        setPaymentError(event.error?.description || "Payment failed. Please try again.");
        setPayingPurchaseId("");
      });
      checkout.open();
    } catch (error) {
      setPaymentError(error.message || "Could not start payment. Please try again.");
      setPayingPurchaseId("");
    }
  };

  const handleDownloadInvoice = async () => {
    setInvoiceDownloadError("");
    setIsDownloadingInvoice(true);
    try {
      await downloadPurchaseInvoice(selectedInvoice, user);
    } catch {
      setInvoiceDownloadError("The invoice PDF could not be generated. Please try again.");
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

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
                <span>Purchase Requests</span>
                <strong>{purchases.length}</strong>
              </div>
            </div>

            <div className="purchase-stat-card">
              <div className="purchase-stat-icon">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Completed</span>
                <strong>
                  {purchases.filter(
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
                  {purchases.filter(
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
                <span>Requested Value</span>
                <strong>{formatCurrency(totalPurchaseValue)}</strong>
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

            {isLoading ? (
              <div className="purchases-empty" role="status">Loading your purchase requests…</div>
            ) : error ? (
              <div className="purchases-empty" role="alert">{error}</div>
            ) : filteredPurchases.length > 0 ? (
              <>
              {paymentError && <p className="purchase-payment-error" role="alert">{paymentError}</p>}
              <div className="purchase-cards">
                {filteredPurchases.map((purchase) => {
                  const payment = paidPurchaseIds.has(purchase.id) ? "Paid" : purchase.payment;
                  const isPaid = payment.toLowerCase() === "paid";
                  const canPay = ["Pending", "Confirmed"].includes(purchase.bookingStatus);
                  return (
                  <article className="purchase-card" key={purchase.id}>
                    <div className="purchase-image">
                      {purchase.image ? (
                        <img src={purchase.image} alt={purchase.name} />
                      ) : (
                        <div className="purchase-image-placeholder" aria-hidden="true">
                          <CarFront size={42} />
                        </div>
                      )}

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
                          <strong className={isPaid ? "payment-paid" : "payment-pending"}>
                            {isPaid ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                            {payment}
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
                          type="button"
                          onClick={() => setSelectedInvoice({
                            ...purchase,
                            payment: paidPurchaseIds.has(purchase.id) ? "Paid" : purchase.payment,
                          })}
                          title="View purchase invoice"
                        >
                          <FileText size={17} />
                          View Invoice
                        </button>

                        <button
                          className="purchase-pay-button"
                          type="button"
                          onClick={() => handlePayNow(purchase)}
                          disabled={isPaid || !canPay || payingPurchaseId === purchase.id}
                          title={!isPaid && !canPay ? "Payment is unavailable for this purchase request." : undefined}
                        >
                          <IndianRupee size={16} />
                          {isPaid
                            ? "Paid"
                            : payingPurchaseId === purchase.id
                              ? "Opening checkout…"
                              : canPay
                                ? "Pay Now"
                                : "Unavailable"}
                        </button>
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>
              </>
            ) : (
              <div className="purchases-empty">
                <div className="purchases-empty-icon">
                  <CarFront size={32} />
                </div>

                <h3>{purchases.length === 0 ? "No purchases yet" : "No purchases found"}</h3>

                <p>
                  {purchases.length === 0
                    ? "Purchase requests you submit will appear here."
                    : "We couldn't find purchases matching your search or filter."}
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

      {selectedInvoice && (
        <div
          className="invoice-overlay"
          onClick={() => setSelectedInvoice(null)}
        >
          <section
            className="purchase-invoice"
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-invoice-title"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSelectedInvoice(null);
            }}
          >
            <div className="purchase-invoice-actions">
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={isDownloadingInvoice}
                aria-label="Download invoice as PDF"
              >
                <FileDown size={16} />
                {isDownloadingInvoice ? "Preparing PDF…" : "Download PDF"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                aria-label="Print invoice"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                aria-label="Close invoice"
              >
                <X size={18} />
              </button>
            </div>
            {invoiceDownloadError && <p className="purchase-invoice-note" role="alert">{invoiceDownloadError}</p>}

            <header className="purchase-invoice-header">
              <div>
                <span>CARRENT</span>
                <h2 id="purchase-invoice-title">Purchase invoice</h2>
              </div>
              <div className={`purchase-invoice-status ${selectedInvoice.payment.toLowerCase()}`}>
                {selectedInvoice.payment}
              </div>
            </header>

            <div className="purchase-invoice-meta">
              <div>
                <span>Invoice number</span>
                <strong>INV-{selectedInvoice.id}</strong>
              </div>
              <div>
                <span>Purchase date</span>
                <strong>{selectedInvoice.date}</strong>
              </div>
            </div>

            <div className="purchase-invoice-parties">
              <div>
                <span>Billed to</span>
                <strong>{user?.fullName || "CarRent customer"}</strong>
                {user?.email && <small>{user.email}</small>}
                {user?.phone && <small>{user.phone}</small>}
              </div>
              <div>
                <span>Vehicle</span>
                <strong>{selectedInvoice.name}</strong>
                <small>{selectedInvoice.location}</small>
              </div>
            </div>

            <div className="purchase-invoice-line">
              <div>
                <strong>{selectedInvoice.name}</strong>
                <small>Vehicle purchase</small>
              </div>
              <strong>{selectedInvoice.price}</strong>
            </div>

            <div className="purchase-invoice-total">
              <span>{selectedInvoice.payment.toLowerCase() === "paid" ? "Amount paid" : "Amount due"}</span>
              <strong>{selectedInvoice.price}</strong>
            </div>

            {selectedInvoice.payment.toLowerCase() !== "paid" && (
              <p className="purchase-invoice-note">
                Payment is pending. This is a purchase summary, not a payment receipt.
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default MyPurchases;
