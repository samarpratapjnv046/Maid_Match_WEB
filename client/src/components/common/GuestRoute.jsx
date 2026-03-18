import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from './Spinner';

/** Redirects already-logged-in users away from login/register pages */
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAF8F3]">
      <Spinner size="lg" />
    </div>
  );

  if (user) {
    if (user.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/search" replace />;
  }

  return children;
}
