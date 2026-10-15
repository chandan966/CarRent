import { useCallback, useEffect, useMemo, useState } from "react";
import { CarFront, CheckCircle, Clock3, RefreshCw, Search, Trash2, XCircle } from "lucide-react";
import { deleteCarListing, getAdminCars, setCarListingStatus } from "../../Services/carservices";
import { useCars } from "../../context/CarsContext";
import "./Cars.css";

function AdminCars() {
  const { refresh: refreshPublicCars } = useCars();
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");

  const loadCars = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setCars(await getAdminCars());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadCars(); }, [loadCars]);

  const filteredCars = useMemo(() => cars.filter((car) => {
    const matchesSearch = `${car.name} ${car.brand} ${car.id}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (typeFilter === "All" || car.listingType === typeFilter.toLowerCase());
  }), [cars, search, typeFilter]);

  const updateStatus = async (car, status) => {
    setPendingId(`${car.listingType}:${car.id}`);
    setError("");
    try {
      await setCarListingStatus(car, status);
      setCars((current) => current.map((item) => item.id === car.id && item.listingType === car.listingType ? { ...item, status } : item));
      await refreshPublicCars();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingId("");
    }
  };

  const removeCar = async (car) => {
    if (!window.confirm(`Delete the listing “${car.name}”? This cannot be undone.`)) return;
    setPendingId(`${car.listingType}:${car.id}`);
    setError("");
    try {
      await deleteCarListing(car);
      setCars((current) => current.filter((item) => item.id !== car.id || item.listingType !== car.listingType));
      await refreshPublicCars();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingId("");
    }
  };

  const counts = {
    all: cars.length,
    buy: cars.filter((car) => car.listingType === "buy").length,
    rent: cars.filter((car) => car.listingType === "rent").length,
    pending: cars.filter((car) => car.status === "pending").length,
  };

  return (
    <div className="admin-cars-page">
      <header className="admin-cars-header">
        <div>
          <span className="admin-cars-label">ADMIN PANEL</span>
          <h1>Car Management</h1>
          <p>Review seller submissions and manage public inventory.</p>
        </div>
        <button className="admin-add-car-btn" type="button" onClick={loadCars} disabled={isLoading}>
          <RefreshCw size={18} aria-hidden="true" /> Refresh inventory
        </button>
      </header>

      <p className="admin-inventory-notice" role="note">
        New seller cars stay private until an administrator approves them. Publishing a listing makes it visible to customers.
      </p>
      {error && <p className="admin-inventory-error" role="alert">{error}</p>}

      <section className="admin-cars-stats" aria-label="Inventory totals">
        <article className="admin-car-stat-card"><div className="admin-stat-icon"><CarFront size={22} /></div><div><span>Total Listings</span><strong>{counts.all}</strong></div></article>
        <article className="admin-car-stat-card"><div className="admin-stat-icon"><CheckCircle size={22} /></div><div><span>For Sale</span><strong>{counts.buy}</strong></div></article>
        <article className="admin-car-stat-card"><div className="admin-stat-icon"><CarFront size={22} /></div><div><span>For Rent</span><strong>{counts.rent}</strong></div></article>
        <article className="admin-car-stat-card"><div className="admin-stat-icon"><Clock3 size={22} /></div><div><span>Needs Review</span><strong>{counts.pending}</strong></div></article>
      </section>

      <div className="admin-cars-toolbar">
        <label className="admin-car-search"><Search size={19} aria-hidden="true" /><span className="sr-only">Search car listings</span><input type="search" placeholder="Search cars…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <select className="admin-car-filter" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter listing type">
          <option value="All">All listing types</option><option value="Buy">For sale</option><option value="Rent">For rent</option>
        </select>
      </div>

      <section className="admin-cars-table-card">
        <div className="admin-table-heading"><div><h2>Inventory</h2><p>{filteredCars.length} listing{filteredCars.length === 1 ? "" : "s"}</p></div></div>
        <div className="admin-cars-table-wrapper">
          <table className="admin-cars-table">
            <thead><tr><th>Car</th><th>Year</th><th>Listing</th><th>Price</th><th>Status</th><th>Review actions</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td className="admin-no-cars" colSpan="6">Loading inventory…</td></tr> : filteredCars.length ? filteredCars.map((car) => {
                const key = `${car.listingType}:${car.id}`;
                return (
                  <tr key={key}>
                    <td><div className="admin-car-name"><img className="admin-car-image-placeholder" src={car.image} alt="" loading="lazy" /><div><strong>{car.name}</strong><span>{car.id}</span></div></div></td>
                    <td>{car.year}</td><td><span className="admin-car-type">{car.listingType === "rent" ? "Rent" : "Buy"}</span></td>
                    <td><strong className="admin-car-price">{car.priceLabel}</strong></td>
                    <td><span className={`admin-car-status ${car.status}`}>{car.status}</span></td>
                    <td><div className="admin-car-actions">
                      {car.status !== "active" && <button type="button" className="admin-action-approve" disabled={pendingId === key} onClick={() => updateStatus(car, "active")}><CheckCircle size={15} /> Publish</button>}
                      {car.status !== "rejected" && <button type="button" className="admin-action-reject" disabled={pendingId === key} onClick={() => updateStatus(car, "rejected")}><XCircle size={15} /> Reject</button>}
                      <button type="button" className="admin-action-delete" aria-label={`Delete ${car.name}`} title="Delete listing" disabled={pendingId === key} onClick={() => removeCar(car)}><Trash2 size={15} /></button>
                    </div></td>
                  </tr>
                );
              }) : <tr><td className="admin-no-cars" colSpan="6">{error ? "Could not load listings." : "No car listings found."}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminCars;
