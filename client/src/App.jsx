import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Customer pages
import SearchWorkers from './pages/customer/SearchWorkers';
import WorkerProfile from './pages/customer/WorkerProfile';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyBookings from './pages/customer/MyBookings';
import BookingDetail from './pages/customer/BookingDetail';

// Worker pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerProfilePage from './pages/worker/WorkerProfile';
import WorkerBookings from './pages/worker/WorkerBookings';
import WorkerWallet from './pages/worker/WorkerWallet';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminWorkers from './pages/admin/AdminWorkers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReviews from './pages/admin/AdminReviews';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

// Profile page (all authenticated users)
import Profile from './pages/Profile';

// Spinner for auth loading
import Spinner from './components/common/Spinner';

// Worker blocked route — redirect workers away, allow everyone else (including guests)
function WorkerBlockedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" color="navy" /></div>;
  if (user?.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
  return children;
}

// Guest route — redirect to dashboard if already logged in
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" color="navy" /></div>;
  if (user) {
    if (user.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Main layout wrapper (with Navbar + Footer)
function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/workers" element={<WorkerBlockedRoute><MainLayout><SearchWorkers /></MainLayout></WorkerBlockedRoute>} />
      <Route path="/workers/:id" element={<WorkerBlockedRoute><MainLayout><WorkerProfile /></MainLayout></WorkerBlockedRoute>} />

      {/* ── Auth routes (guests only) ── */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* ── Customer routes ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MainLayout><CustomerDashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MainLayout><MyBookings /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:id"
        element={
          <ProtectedRoute allowedRoles={['customer', 'worker', 'admin']}>
            <MainLayout><BookingDetail /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Shared profile route ── */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout><Profile /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Worker routes ── */}
      <Route
        path="/worker/dashboard"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <MainLayout><WorkerDashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/profile"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <MainLayout><WorkerProfilePage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/bookings"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <MainLayout><WorkerBookings /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/wallet"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <MainLayout><WorkerWallet /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Admin routes (no main Navbar/Footer — admin has own layout) ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="workers" element={<AdminWorkers />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<MainLayout><Navigate to="/" replace /></MainLayout>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
