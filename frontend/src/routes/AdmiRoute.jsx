import ProtectedRoute from "./ProtectedRoute";

function AdmiRoute({ children }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}

export default AdmiRoute;
