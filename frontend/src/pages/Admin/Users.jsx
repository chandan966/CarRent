import { Search, Trash2, UserCog } from "lucide-react";
import "./Users.css";

const users = [
  { id: 1, name: "Rohan Mehta", email: "rohan@car-rental.com", role: "Customer", status: "Active", plan: "Premium" },
  { id: 2, name: "Anita Shah", email: "anita@car-rental.com", role: "Seller", status: "Active", plan: "Business" },
  { id: 3, name: "Vikram Nair", email: "vikram@car-rental.com", role: "Customer", status: "Pending", plan: "Standard" },
  { id: 4, name: "Priya Sen", email: "priya@car-rental.com", role: "Customer", status: "Active", plan: "Premium" },
  { id: 5, name: "Manav Roy", email: "manav@car-rental.com", role: "Admin", status: "Active", plan: "Admin" },
];

function AdminUsers() {
  return (
    <div className="admin-users-page">
      <header className="admin-table-header">
        <div>
          <span className="admin-mini-label">USER MANAGEMENT</span>
          <h1>Users</h1>
        </div>
        <div className="admin-search-box">
          <Search size={18} />
          <input type="text" placeholder="Search users..." />
        </div>
      </header>

      <section className="admin-card-table">
        <div className="admin-card-header">
          <h2>All users</h2>
          <button className="admin-primary-btn">Add user</button>
        </div>

        <div className="admin-data-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-user-avatar">{user.name.charAt(0)}</div>
                      <div>
                        <strong>{user.name}</strong>
                        <span>ID #{user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.plan}</td>
                  <td>
                    <span className={`admin-status ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-action-group">
                      <button className="table-icon-button" title="Manage user">
                        <UserCog size={16} />
                      </button>
                      <button className="table-icon-button danger" title="Remove user">
                        <Trash2 size={16} />
                      </button>
                    </div>
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

export default AdminUsers;
