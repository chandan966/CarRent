import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, ShieldCheck, UserRound, UserX } from "lucide-react";
import { getAdminUsers, updateAdminUser } from "../../Services/adminServices";
import { useAuth } from "../../context/useAuth";
import "./Users.css";

function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try { setUsers(await getAdminUsers()); }
    catch (requestError) { setError(requestError.message); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((item) => !query || `${item.fullName} ${item.email} ${item.role}`.toLowerCase().includes(query));
  }, [users, search]);

  const updateUser = async (target, changes) => {
    setBusyId(target.id);
    setError("");
    try {
      const updated = await updateAdminUser(target.id, changes);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  };

  return (
    <div className="admin-users-page">
      <header className="admin-table-header">
        <div><span className="admin-mini-label">USER MANAGEMENT</span><h1>Users</h1><p>Review accounts and manage access safely.</p></div>
        <button className="admin-primary-btn" type="button" onClick={loadUsers} disabled={isLoading}><RefreshCw size={16} /> Refresh users</button>
      </header>
      <p className="admin-users-notice" role="note">New users always register with the standard user role. Admin access can only be assigned here by an existing administrator. You cannot disable your own account or remove the last active administrator.</p>
      {error && <p className="admin-users-error" role="alert">{error}</p>}
      <section className="admin-card-table">
        <div className="admin-card-header">
          <h2>Accounts <span className="admin-user-count">{users.length}</span></h2>
          <label className="admin-search-box"><Search size={17} aria-hidden="true" /><span className="sr-only">Search users</span><input type="search" placeholder="Search name, email, or role" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        </div>
        <div className="admin-data-wrap">
          <table className="admin-data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Account</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan="5">Loading accounts…</td></tr> : filteredUsers.length ? filteredUsers.map((item) => (
                <tr key={item.id}>
                  <td><div className="admin-user-cell"><div className="admin-user-avatar">{String(item.fullName || "U").slice(0, 1).toUpperCase()}</div><div><strong>{item.fullName}</strong><span>{item.location || ""}</span></div></div></td>
                  <td>{item.email}</td>
                  <td><span className={`admin-user-role ${item.role}`}>{item.role}</span></td>
                  <td><span className={`admin-status ${item.isActive ? "active" : "inactive"}`}>{item.isActive ? "Active" : "Disabled"}</span></td>
                  <td><div className="admin-user-actions">
                    <button type="button" disabled={busyId === item.id || !item.isActive && item.role === "admin"} onClick={() => updateUser(item, { role: item.role === "admin" ? "user" : "admin" })} title={item.role === "admin" ? "Remove admin role" : "Grant admin role"}>
                      <ShieldCheck size={15} /> {item.role === "admin" ? "Make user" : "Make admin"}
                    </button>
                    <button type="button" className="danger" disabled={busyId === item.id || item.id === currentUser?.id} onClick={() => updateUser(item, { isActive: !item.isActive })} title={item.isActive ? "Disable account" : "Enable account"}>
                      <UserX size={15} /> {item.isActive ? "Disable" : "Enable"}
                    </button>
                  </div></td>
                </tr>
              )) : <tr><td className="admin-users-empty" colSpan="5"><UserRound size={25} /><strong>{search ? "No accounts match your search." : "No accounts found."}</strong></td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminUsers;
