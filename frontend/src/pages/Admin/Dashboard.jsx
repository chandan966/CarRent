import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CarFront,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  Users,
  WalletCards,
} from "lucide-react";
import "./Dashboard.css";

const stats = [
  { label: "Total Revenue", value: "₹28.4L", change: "+18.2%", tone: "revenue" },
  { label: "Active Listings", value: "156", change: "+9 new", tone: "listings" },
  { label: "Booked Cars", value: "84", change: "+12 this month", tone: "bookings" },
  { label: "Customer Growth", value: "1.4K", change: "+22.5%", tone: "customers" },
];

const recentActivity = [
  { title: "New BMW X5 booked", by: "Rohan Mehta", time: "12 mins ago" },
  { title: "Mercedes C-Class sold", by: "Anita Shah", time: "38 mins ago" },
  { title: "Service request approved", by: "Vikram Nair", time: "1 hour ago" },
  { title: "New customer signup", by: "Priya Sen", time: "2 hours ago" },
];

const topCars = [
  { name: "BMW 3 Series", sales: "₹14.8L", status: "Trending" },
  { name: "Audi Q7", sales: "₹11.2L", status: "Premium" },
  { name: "Toyota Fortuner", sales: "₹9.6L", status: "Popular" },
  { name: "Hyundai Creta", sales: "₹6.8L", status: "Family Favorite" },
];

function AdminDashboard() {
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
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-label">ADMIN OVERVIEW</span>
            <h1>Dashboard</h1>
          </div>
          <button className="admin-primary-btn">Export Report</button>
        </header>

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
                <strong>{stat.value}</strong>
                <small>{stat.change}</small>
              </div>
            </article>
          ))}
        </section>

        <section className="admin-content-grid">
          <article className="admin-panel-card wide-panel">
            <div className="admin-panel-header">
              <h2>Top performing cars</h2>
              <button className="admin-link-btn">
                View all <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th>Sales</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topCars.map((car) => (
                    <tr key={car.name}>
                      <td>{car.name}</td>
                      <td>{car.sales}</td>
                      <td><span className="status-pill">{car.status}</span></td>
                    </tr>
                  ))}
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
                <li key={`${item.title}-${item.time}`}>
                  <div className="activity-dot" />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.by}</span>
                  </div>
                  <em>{item.time}</em>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
