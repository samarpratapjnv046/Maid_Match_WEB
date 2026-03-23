import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { useAuth } from './hooks/useAuth';
import MessageNotifications from './components/chat/MessageNotifications';
import ChatWindow from './components/chat/ChatWindow';

// Layout (always needed — not lazy)
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Spinner from './components/common/Spinner';

// ─── Lazy-loaded page chunks ────────────────────────────────────────────────
// Public
const Home           = lazy(() => import('./pages/Home'));
const Login          = lazy(() => import('./pages/Login'));
const Register       = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AuthCallback   = lazy(() => import('./pages/AuthCallback'));
const Terms          = lazy(() => import('./pages/Terms'));
const Privacy        = lazy(() => import('./pages/Privacy'));
const Profile        = lazy(() => import('./pages/Profile'));

// Customer
const SearchWorkers    = lazy(() => import('./pages/customer/SearchWorkers'));
const WorkerProfile    = lazy(() => import('./pages/customer/WorkerProfile'));
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const MyBookings       = lazy(() => import('./pages/customer/MyBookings'));
const BookingDetail    = lazy(() => import('./pages/customer/BookingDetail'));
const FavoriteWorkers  = lazy(() => import('./pages/customer/FavoriteWorkers'));

// Worker
const WorkerDashboard   = lazy(() => import('./pages/worker/WorkerDashboard'));
const WorkerProfilePage = lazy(() => import('./pages/worker/WorkerProfile'));
const WorkerBookings    = lazy(() => import('./pages/worker/WorkerBookings'));
const WorkerWallet      = lazy(() => import('./pages/worker/WorkerWallet'));

// Admin (all in one chunk — only admins ever download these)
const AdminLayout         = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard      = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers          = lazy(() => import('./pages/admin/AdminUsers'));
const AdminWorkers        = lazy(() => import('./pages/admin/AdminWorkers'));
const AdminBookings       = lazy(() => import('./pages/admin/AdminBookings'));
const AdminPayments       = lazy(() => import('./pages/admin/AdminPayments'));
const AdminReviews        = lazy(() => import('./pages/admin/AdminReviews'));
const AdminAuditLogs      = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminWithdrawals    = lazy(() => import('./pages/admin/AdminWithdrawals'));
const AdminRefundRequests = lazy(() => import('./pages/admin/AdminRefundRequests'));

// ─── Page loading fallback ───────────────────────────────────────────────────
function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" color="navy" />
    </div>
  );
}

// ─── Route guards ────────────────────────────────────────────────────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

function HomeRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AdminRedirectProfile() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin/profile" replace />;
  return <MainLayout><Profile /></MainLayout>;
}

function CatchAll() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <MainLayout><Navigate to="/" replace /></MainLayout>;
}

// ─── Main layout ─────────────────────────────────────────────────────────────
function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
    </div>
  );
}

// ─── Routes ──────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<HomeRoute><MainLayout><Home /></MainLayout></HomeRoute>} />
        <Route path="/workers" element={<HomeRoute><MainLayout><SearchWorkers /></MainLayout></HomeRoute>} />
        <Route path="/workers/:id" element={<HomeRoute><MainLayout><WorkerProfile /></MainLayout></HomeRoute>} />
        <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
        <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ── Auth (guests only) ── */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Customer ── */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><MainLayout><CustomerDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute allowedRoles={['customer']}><MainLayout><MyBookings /></MainLayout></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute allowedRoles={['customer']}><MainLayout><FavoriteWorkers /></MainLayout></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute allowedRoles={['customer', 'worker', 'admin']}><MainLayout><BookingDetail /></MainLayout></ProtectedRoute>} />

        {/* ── Shared profile ── */}
        <Route path="/profile" element={<ProtectedRoute><AdminRedirectProfile /></ProtectedRoute>} />

        {/* ── Worker ── */}
        <Route path="/worker/dashboard" element={<ProtectedRoute allowedRoles={['worker']}><MainLayout><WorkerDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/worker/setup" element={<ProtectedRoute allowedRoles={['customer', 'worker']}><MainLayout><WorkerProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="/worker/profile" element={<ProtectedRoute allowedRoles={['worker']}><MainLayout><WorkerProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="/worker/bookings" element={<ProtectedRoute allowedRoles={['worker']}><MainLayout><WorkerBookings /></MainLayout></ProtectedRoute>} />
        <Route path="/worker/wallet" element={<ProtectedRoute allowedRoles={['worker']}><MainLayout><WorkerWallet /></MainLayout></ProtectedRoute>} />

        {/* ── Admin ── */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="workers" element={<AdminWorkers />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="refund-requests" element={<AdminRefundRequests />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<CatchAll />} />
      </Routes>
    </Suspense>
  );
}

// ─── Global notification + chat layer ────────────────────────────────────────
function GlobalChat() {
  const [chatFromNotif, setChatFromNotif] = useState(null);
  return (
    <>
      <MessageNotifications
        onOpenChat={(notif) =>
          setChatFromNotif({ bookingId: notif.bookingId, otherPartyName: notif.senderName })
        }
      />
      {chatFromNotif && (
        <ChatWindow
          bookingId={chatFromNotif.bookingId}
          otherPartyName={chatFromNotif.otherPartyName}
          onClose={() => setChatFromNotif(null)}
        />
      )}
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Router>
        <SocketProvider>
          <AppRoutes />
          <GlobalChat />
        </SocketProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
