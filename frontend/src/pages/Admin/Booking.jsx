import { CalendarRange, CarFront, CheckCircle2, Search, XCircle } from "lucide-react";
import "./Booking.css";

const bookings = [
  { id: "BK-2048", customer: "Rohan Mehta", car: "BMW 3 Series", type: "Purchase", date: "12 Aug 2026", status: "Confirmed" },
  { id: "BK-2049", customer: "Anita Shah", car: "Audi Q7", type: "Rental", date: "15 Aug 2026", status: "Pending" },
  { id: "BK-2050", customer: "Vikram Nair", car: "Toyota Fortuner", type: "Rental", date: "18 Aug 2026", status: "Pending" },
  { id: "BK-2051", customer: "Priya Sen", car: "Mercedes C-Class", type: "Purchase", date: "20 Aug 2026", status: "Completed" },
];

function AdminBookings() {
  return (
    <div className="admin-bookings-page">
      <header className="admin-table-header">
        <div>
          <span className="admin-mini-label">BOOKINGS</span>
          <h1>Booking Management</h1>
        </div>
        <div className="admin-search-box">
          <Search size={18} />
          <input type="text" placeholder="Search bookings..." />
        </div>
      </header>

      <section className="admin-card-table">
        <div className="admin-card-header">
          <h2>Recent bookings</h2>
          <button className="admin-primary-btn">New booking</button>
        </div>

        <div className="admin-data-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Car</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.customer}</td>
                  <td>
                    <div className="admin-booking-car">
                      <CarFront size={16} />
                      {booking.car}
                    </div>
                  </td>
                  <td>{booking.type}</td>
                  <td>
                    <div className="booking-date-cell">
                      <CalendarRange size={15} />
                      {booking.date}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-status ${booking.status.toLowerCase().replace(/\s+/g, "-")}`}>
                      {booking.status === "Completed" ? <CheckCircle2 size={14} /> : booking.status === "Pending" ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                      {booking.status}
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

export default AdminBookings;
