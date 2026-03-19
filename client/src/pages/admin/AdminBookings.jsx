import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Filter, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers';

const STATUS_OPTIONS = [
  { value: '',                label: 'All Statuses' },
  { value: 'offer_pending',   label: 'Offer Pending' },
  { value: 'accepted',        label: 'Accepted' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'paid',            label: 'Paid' },
  { value: 'completed',       label: 'Completed' },
  { value: 'cancelled',       label: 'Cancelled' },
  { value: 'rejected',        label: 'Rejected' },
  { value: 'refunded',        label: 'Refunded' },
];

export default function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(e, bookingId) {
    e.stopPropagation();
    if (!window.confirm('Delete this booking? This cannot be undone.')) return;
    setDeletingId(bookingId);
    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success('Booking deleted.');
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete booking.');
    } finally {
      setDeletingId(null);
    }
  }

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/bookings${params}`);
      setBookings(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1B2B4B]">Bookings</h1>
          <p className="text-gray-500 text-sm mt-0.5">View and manage all bookings on the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] bg-white text-gray-700"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary badge */}
      {!loading && (
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-[#1B2B4B]">{bookings.length}</span> booking{bookings.length !== 1 ? 's' : ''}
          {statusFilter ? ` with status "${getStatusLabel(statusFilter)}"` : ''}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : bookings.length === 0 ? (
        <EmptyState icon="📅" title="No bookings found" description="Try changing the status filter." />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Booking ID', 'Customer', 'Worker', 'Service', 'Status', 'Amount', 'Date', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <tr
                    key={b._id}
                    onClick={() => navigate(`/bookings/${b._id}`)}
                    className="hover:bg-[#FAF8F3] transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-500 group-hover:text-[#1B2B4B] transition-colors">
                        #{b._id?.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1B2B4B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(b.user_id?.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-800 whitespace-nowrap">
                          {b.user_id?.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#C9A84C]/20 text-[#1B2B4B] flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(b.worker_id?.user_id?.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-800 whitespace-nowrap">
                          {b.worker_id?.user_id?.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap capitalize">
                      {b.service_type?.replace(/_/g, ' ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${getStatusColor(b.status)}`}>
                        {getStatusLabel(b.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">
                      {b.price?.base_amount != null ? formatCurrency(b.price.base_amount) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {b.createdAt ? formatDate(b.createdAt) : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDelete(e, b._id)}
                        disabled={deletingId === b._id}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete booking"
                      >
                        {deletingId === b._id ? <Spinner size="sm" /> : <Trash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
