import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../common/Spinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" color="navy" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their correct dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
