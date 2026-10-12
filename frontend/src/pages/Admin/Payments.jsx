import { DollarSign, Search, TrendingUp } from "lucide-react";
import "./Payments.css";

const payments = [
  { id: "PAY-3321", customer: "Rohan Mehta", car: "BMW 3 Series", amount: "₹42.00L", method: "UPI", status: "Paid" },
  { id: "PAY-3322", customer: "Anita Shah", car: "Audi Q7", amount: "₹85.00L", method: "Bank Transfer", status: "Pending" },
  { id: "PAY-3323", customer: "Vikram Nair", car: "Toyota Fortuner", amount: "₹3,500", method: "Card", status: "Paid" },
  { id: "PAY-3324", customer: "Priya Sen", car: "Mercedes C-Class", amount: "₹58.00L", method: "UPI", status: "Review" },
];

function AdminPayments() {
  return (
    <div className="admin-payments-page">
      <header className="admin-table-header">
        <div>
          <span className="admin-mini-label">PAYMENTS</span>
          <h1>Payment Overview</h1>
        </div>
        <div className="admin-search-box">
          <Search size={18} />
          <input type="text" placeholder="Search payments..." />
        </div>
      </header>

      <section className="admin-payments-summary">
        <article className="admin-pay-card success">
          <div className="admin-pay-icon"><DollarSign size={18} /></div>
          <div>
            <span>Total Collected</span>
            <strong>₹28.4L</strong>
          </div>
        </article>

        <article className="admin-pay-card warning">
          <div className="admin-pay-icon"><TrendingUp size={18} /></div>
          <div>
            <span>Pending</span>
            <strong>₹8.9L</strong>
          </div>
        </article>
      </section>

      <section className="admin-card-table">
        <div className="admin-card-header">
          <h2>Transactions</h2>
        </div>

        <div className="admin-data-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Customer</th>
                <th>Car</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.customer}</td>
                  <td>{payment.car}</td>
                  <td>{payment.amount}</td>
                  <td>{payment.method}</td>
                  <td>
                    <span className={`admin-status ${payment.status.toLowerCase()}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminPayments;
