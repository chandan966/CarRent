import ProtectedRoute from "./ProtectedRoute";

function AdminRoute({ children }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}

export default AdminRoute;
