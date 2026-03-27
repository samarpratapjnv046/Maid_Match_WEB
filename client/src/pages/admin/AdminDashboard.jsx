import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
} from 'lucide-react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers';

function StatCard({ icon: Icon, label, value, color = 'gold' }) {
  const iconBg = color === 'gold' ? 'bg-[#C9A84C]/15' : 'bg-[#1B2B4B]/10';
  const iconColor = color === 'gold' ? 'text-[#C9A84C]' : 'text-[#1B2B4B]';
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-[#1B2B4B] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalWorkers: 0, totalBookings: 0, totalRevenue: 0 });
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [rejectModal, setRejectModal] = useState({ open: false, worker: null });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, usersRes, allWorkersRes, pendingWorkersRes, bookingsRes] = await Promise.all([
        api.get('/admin/revenue'),
        api.get('/admin/users?limit=1'),
        api.get('/admin/workers?limit=1'),
        api.get('/admin/workers?verification_status=pending'),
        api.get('/admin/bookings?limit=5'),
      ]);
      const rev = revRes.data?.data?.revenue || {};
      const bookingsByStatus = revRes.data?.data?.bookings_by_status || [];
      const totalBookings = bookingsByStatus.reduce((sum, s) => sum + s.count, 0);
      setStats({
        totalUsers: usersRes.data?.total ?? 0,
        totalWorkers: allWorkersRes.data?.total ?? 0,
        totalBookings,
        totalRevenue: (rev.totalRevenue ?? 0) / 100,
        pendingVerifications: pendingWorkersRes.data?.total ?? 0,
        activeBookingsCount: bookingsRes.data?.total ?? 0,
      });
      setPendingWorkers(pendingWorkersRes.data?.data || []);
      setActiveBookings(bookingsRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleVerify = async (workerId) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/workers/${workerId}/verify`);
      toast.success('Worker verified successfully');
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOpen = (worker) => {
    setRejectReason('');
    setRejectModal({ open: true, worker });
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/admin/workers/${rejectModal.worker._id}/reject`, { reason: rejectReason });
      toast.success('Worker rejected');
      setRejectModal({ open: false, worker: null });
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#1B2B4B]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. Here's what's happening on MaidSaathi.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard icon={Users}       label="Total Users"             value={stats.totalUsers} />
        <StatCard icon={Briefcase}   label="Total Workers"           value={stats.totalWorkers} />
        <StatCard icon={Calendar}    label="Total Bookings"          value={stats.totalBookings} />
        <StatCard icon={DollarSign}  label="Total Revenue"           value={formatCurrency(stats.totalRevenue)} color="navy" />
        <StatCard icon={Clock}       label="Pending Verifications"   value={stats.pendingVerifications} />
        <StatCard icon={CheckCircle} label="Active Bookings"         value={stats.activeBookingsCount} />
      </div>

      {/* Pending Worker Verifications */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-semibold text-[#1B2B4B]">Pending Worker Verifications</h2>
          <button
            onClick={() => navigate('/admin/workers')}
            className="text-sm text-[#C9A84C] hover:underline font-medium"
          >
            View all
          </button>
        </div>

        {pendingWorkers.length === 0 ? (
          <EmptyState icon="✅" title="No pending verifications" description="All worker applications have been reviewed." />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Worker', 'Email', 'City', 'Services', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingWorkers.slice(0, 5).map((w) => (
                    <tr key={w._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1B2B4B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {w.user_id?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{w.user_id?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{w.user_id?.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{w.location?.city || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(w.services || []).slice(0, 2).map((s) => (
                            <span key={s} className="bg-[#1B2B4B]/10 text-[#1B2B4B] text-xs px-2 py-0.5 rounded-full font-medium">
                              {getStatusLabel(s)}
                            </span>
                          ))}
                          {(w.services || []).length > 2 && (
                            <span className="text-xs text-gray-400">+{w.services.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerify(w._id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleRejectOpen(w)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Recent Active Bookings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-semibold text-[#1B2B4B]">Recent Active Bookings</h2>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="text-sm text-[#C9A84C] hover:underline font-medium"
          >
            View all
          </button>
        </div>

        {activeBookings.length === 0 ? (
          <EmptyState icon="📅" title="No active bookings" description="There are no currently active bookings." />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Booking ID', 'Customer', 'Worker', 'Service', 'Status', 'Amount', 'Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeBookings.slice(0, 5).map((b) => (
                    <tr
                      key={b._id}
                      onClick={() => navigate(`/bookings/${b._id}`)}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        #{b._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {b.user_id?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {b.worker_id?.user_id?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                        {b.service_type?.replace(/_/g, ' ') || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(b.status)}`}>
                          {getStatusLabel(b.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {b.price?.base_amount != null ? formatCurrency(b.price.base_amount) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {b.createdAt ? formatDate(b.createdAt) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, worker: null })}
        title="Reject Worker"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are rejecting <span className="font-semibold text-[#1B2B4B]">{rejectModal.worker?.user_id?.name}</span>.
            Please provide a reason.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete documents, suspicious activity..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRejectModal({ open: false, worker: null })}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectSubmit}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading && <Spinner size="sm" color="white" />}
              Reject Worker
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
