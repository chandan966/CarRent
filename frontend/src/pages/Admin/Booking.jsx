import { useMemo, useState } from "react";
import { CalendarRange, CarFront, CheckCircle2, Search, Clock3 } from "lucide-react";
import { useBookings } from "../../hooks/useBookings";
import { updateAdminBooking } from "../../Services/adminServices";
import "./Booking.css";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function AdminBookings() {
  const { bookings, isLoading, error } = useBookings();
  const [search, setSearch] = useState("");
  const [statusById, setStatusById] = useState({});
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const saveStatus = async (booking, status) => {
    setBusyId(booking.id);
    setActionError("");
    try {
      await updateAdminBooking(booking.id, status);
      setStatusById((current) => ({ ...current, [booking.id]: status }));
    } catch (requestError) { setActionError(requestError.message); }
    finally { setBusyId(""); }
  };
  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return bookings;
    return bookings.filter((booking) =>
      [booking.id, booking.fullName, booking.email, booking.carName, booking.bookingType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [bookings, search]);

  return (
    <div className="admin-bookings-page">
      <header className="admin-table-header">
        <div>
          <span className="admin-mini-label">BOOKINGS</span>
          <h1>Booking Management</h1>
        </div>
        <div className="admin-search-box">
          <Search size={18} />
          <input type="search" placeholder="Search bookings…" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </header>

      <section className="admin-card-table">
        <div className="admin-card-header">
          <h2>Booking requests</h2>
          <span>{filteredBookings.length} request{filteredBookings.length === 1 ? "" : "s"}</span>
        </div>

        {actionError && <p className="admin-booking-action-error" role="alert">{actionError}</p>}

        {isLoading ? <p role="status">Loading booking requests…</p> : error ? <p role="alert">{error}</p> : (
          <div className="admin-data-wrap">
            <table className="admin-data-table">
              <thead>
                <tr><th>Booking ID</th><th>Customer</th><th>Car</th><th>Type</th><th>Date</th><th>Status</th><th>Update</th></tr>
              </thead>
              <tbody>
                {filteredBookings.length ? filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.fullName}<br /><small>{booking.email || ""}</small></td>
                    <td><div className="admin-booking-car"><CarFront size={16} />{booking.carName}</div></td>
                    <td>{booking.bookingType === "rent" ? "Rental" : "Purchase"}</td>
                    <td><div className="booking-date-cell"><CalendarRange size={15} />{formatDate(booking.startDate || booking.createdAt)}</div></td>
                    <td><span className={`admin-status ${String(statusById[booking.id] || booking.status || "Pending").toLowerCase()}`}>
                      {String(statusById[booking.id] || booking.status || "Pending").toLowerCase() === "completed" ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                      {statusById[booking.id] || booking.status || "Pending"}
                    </span></td>
                    <td><select aria-label={`Update ${booking.id} status`} value={statusById[booking.id] || booking.status || "Pending"} disabled={busyId === booking.id} onChange={(event) => saveStatus(booking, event.target.value)}><option>Pending</option><option>Confirmed</option><option>Cancelled</option><option>Completed</option></select></td>
                  </tr>
                )) : <tr><td colSpan="7">{search ? "No booking requests match your search." : "No booking requests yet."}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminBookings;
