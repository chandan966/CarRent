import { useCallback, useEffect, useState } from "react";
import { CreditCard, RefreshCw, ShieldCheck } from "lucide-react";
import { getAdminPayments } from "../../Services/adminServices";
import "./Payments.css";

function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await getAdminPayments();
      setPayments(result.payments || []);
    } catch (requestError) { setError(requestError.message); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="admin-payments-page">
      <header className="admin-table-header">
        <div><span className="admin-mini-label">PAYMENT STATUS</span><h1>Payments</h1><p>Review payment state attached to booking requests.</p></div>
        <button className="admin-primary-btn" type="button" onClick={load} disabled={isLoading}><RefreshCw size={16} /> Refresh</button>
      </header>
      <section className="admin-payment-unavailable" role="note">
        <span><CreditCard size={24} aria-hidden="true" /></span>
        <div><strong>Online payment processing is not configured</strong><p>These are requested prices and recorded payment statuses only. CarRent has not collected money. A provider account and verified payment webhooks are required before payments can be accepted.</p></div>
      </section>
      {error && <p className="admin-payment-error" role="alert">{error}</p>}
      <section className="admin-card-table admin-payment-placeholder">
        <div className="admin-card-header"><h2>Booking payment records</h2><span>{payments.length} records</span><ShieldCheck size={19} aria-hidden="true" /></div>
        <div className="admin-data-wrap">
          <table className="admin-data-table">
            <thead><tr><th>Booking</th><th>Customer</th><th>Car</th><th>Request type</th><th>Quoted amount</th><th>Payment status</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan="6">Loading payment status…</td></tr> : payments.length ? payments.map((item) => (
                <tr key={item.bookingId}><td>{item.bookingId}</td><td>{item.customerName}<br /><small>{item.email}</small></td><td>{item.carName}</td><td>{item.bookingType === "rent" ? "Rental" : "Purchase"}</td><td>{money(item.amount)}</td><td><span className={`admin-payment-status ${String(item.paymentStatus || "pending").toLowerCase()}`}>{item.paymentStatus || "Pending"}</span></td></tr>
              )) : <tr><td colSpan="6">No booking payment records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminPayments;
