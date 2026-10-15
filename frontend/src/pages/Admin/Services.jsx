import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Wrench } from "lucide-react";
import { getServiceRequests, updateServiceRequestStatus } from "../../Services/adminServices";
import "./Services.css";

function AdminServices() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try { setRequests(await getServiceRequests()); }
    catch (requestError) { setError(requestError.message); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (item, status) => {
    setBusyId(item.id);
    setError("");
    try {
      await updateServiceRequestStatus(item.id, status);
      setRequests((current) => current.map((request) => request.id === item.id ? { ...request, status } : request));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  };

  return (
    <main className="admin-services-page">
      <header className="admin-table-header">
        <div><span className="admin-mini-label">SERVICE DESK</span><h1>Service requests</h1><p>Review customer requests and update their status.</p></div>
        <button className="admin-primary-btn" type="button" onClick={load} disabled={isLoading}><RefreshCw size={16} /> Refresh requests</button>
      </header>
      {error && <p className="admin-service-error" role="alert">{error}</p>}
      <section className="admin-card-table">
        <div className="admin-card-header"><h2>Requests</h2><span>{requests.length} total</span></div>
        <div className="admin-data-wrap">
          <table className="admin-data-table">
            <thead><tr><th>Request</th><th>Customer</th><th>Contact</th><th>Preferred date</th><th>Notes</th><th>Status</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan="6">Loading service requests…</td></tr> : requests.length ? requests.map((item) => (
                <tr key={item.id}>
                  <td><div className="admin-service-name"><Wrench size={17} /><div><strong>{item.serviceName}</strong><span>{item.id}</span></div></div></td>
                  <td>{item.fullName}</td><td><a href={`mailto:${encodeURIComponent(item.email)}`}>{item.email}</a><br /><a href={`tel:${encodeURIComponent(item.phone)}`}>{item.phone}</a></td>
                  <td>{new Date(`${item.preferredDate}T00:00:00`).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                  <td className="admin-service-notes">{item.notes || "—"}</td>
                  <td><select aria-label={`Update request ${item.id} status`} value={item.status} disabled={busyId === item.id} onChange={(event) => updateStatus(item, event.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></td>
                </tr>
              )) : <tr><td colSpan="6">No service requests yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default AdminServices;
