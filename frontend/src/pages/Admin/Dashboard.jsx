import { Link } from "react-router-dom";
import { useMemo } from "react";
import {
  ArrowUpRight,
  CarFront,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  Users,
  WalletCards,
  Wrench,
} from "lucide-react";
import "./Dashboard.css";
import { useBookings } from "../../hooks/useBookings";

function csvCell(value) {
  const text = String(value ?? "");
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function AdminDashboard() {
  const { bookings, isLoading, error } = useBookings();
  const stats = useMemo(() => [
    { label: "Total Requests", value: bookings.length, tone: "bookings" },
    { label: "Purchase Requests", value: bookings.filter((booking) => booking.bookingType === "buy").length, tone: "revenue" },
    { label: "Rental Requests", value: bookings.filter((booking) => booking.bookingType === "rent").length, tone: "listings" },
    { label: "Pending Requests", value: bookings.filter((booking) => !["completed", "cancelled"].includes(String(booking.status || "").toLowerCase())).length, tone: "customers" },
  ], [bookings]);
  const topCars = useMemo(() => {
    const counts = new Map();
    bookings.forEach((booking) => {
      const name = booking.carName || "Car not specified";
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, requests]) => ({ name, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5);
  }, [bookings]);
  const recentActivity = bookings.slice(0, 5);

  const exportBookings = () => {
    if (!bookings.length) return;
    const headings = ["Booking ID", "Customer", "Email", "Car", "Type", "Start date", "Days", "Amount", "Status"];
    const rows = bookings.map((booking) => [
      booking.id,
      booking.fullName,
      booking.email,
      booking.carName,
      booking.bookingType,
      booking.startDate,
      booking.days,
      booking.amount,
      booking.status,
    ]);
    const csv = [headings, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blobUrl = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "carrent-booking-requests.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  return (
    <div className="admin-dashboard-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-badge">
            <CarFront size={20} />
          </div>
          <div>
            <strong>CarRent</strong>
            <span>Admin</span>
          </div>
        </div>

        <nav className="admin-nav">
          <Link className="admin-nav-link active" to="/admin/dashboard">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link className="admin-nav-link" to="/admin/cars">
            <CarFront size={18} />
            Cars
          </Link>
          <Link className="admin-nav-link" to="/admin/bookings">
            <ClipboardList size={18} />
            Bookings
          </Link>
          <Link className="admin-nav-link" to="/admin/users">
            <Users size={18} />
            Users
          </Link>
          <Link className="admin-nav-link" to="/admin/payments">
            <WalletCards size={18} />
            Payments
          </Link>
          <Link className="admin-nav-link" to="/admin/services">
            <Wrench size={18} />
            Service requests
          </Link>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-label">ADMIN OVERVIEW</span>
            <h1>Dashboard</h1>
          </div>
          <button className="admin-primary-btn" type="button" onClick={exportBookings} disabled={!bookings.length || isLoading} title={!bookings.length ? "There are no booking requests to export" : "Download booking requests as CSV"}>Export booking CSV</button>
        </header>

        {error && <p className="admin-dashboard-notice" role="alert">Could not load live booking data: {error}</p>}

        <section className="admin-stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className="admin-stat-card">
              <div className={`admin-stat-icon ${stat.tone}`}>
                {stat.tone === "revenue" && <CircleDollarSign size={20} />}
                {stat.tone === "listings" && <CarFront size={20} />}
                {stat.tone === "bookings" && <ClipboardList size={20} />}
                {stat.tone === "customers" && <Users size={20} />}
              </div>
              <div>
                <span>{stat.label}</span>
                <strong>{isLoading ? "—" : stat.value}</strong>
                <small>Live booking data</small>
              </div>
            </article>
          ))}
        </section>

        <section className="admin-content-grid">
          <article className="admin-panel-card wide-panel">
            <div className="admin-panel-header">
              <h2>Most requested cars</h2>
              <Link className="admin-link-btn" to="/admin/bookings">
                View bookings <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th>Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {topCars.map((car) => (
                    <tr key={car.name}>
                      <td>{car.name}</td>
                      <td>{car.requests}</td>
                    </tr>
                  ))}
                  {!isLoading && !error && topCars.length === 0 && <tr><td colSpan="2">No booking requests yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </article>

          <article className="admin-panel-card">
            <div className="admin-panel-header">
              <h2>Recent activity</h2>
            </div>

            <ul className="admin-activity-list">
              {recentActivity.map((item) => (
                <li key={item.id}>
                  <div className="activity-dot" />
                  <div>
                    <strong>{item.bookingType === "rent" ? "Rental request" : "Purchase request"} · {item.carName || "Car"}</strong>
                    <span>{item.fullName || "Customer"}</span>
                  </div>
                  <em>{item.status || "Pending"}</em>
                </li>
              ))}
              {!isLoading && !error && recentActivity.length === 0 && <li>No recent requests yet.</li>}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
