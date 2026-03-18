import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { DollarSign, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers';

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/15 flex items-center justify-center flex-shrink-0">
        <Icon size={22} className="text-[#C9A84C]" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-[#1B2B4B] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [revenue, setRevenue]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [refundModal, setRefundModal] = useState({ open: false, payment: null });
  const [refundReason, setRefundReason] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsRes, revenueRes] = await Promise.all([
        api.get('/admin/payments'),
        api.get('/admin/revenue'),
      ]);
      setPayments(paymentsRes.data?.payments || paymentsRes.data || []);
      setRevenue(revenueRes.data);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefundSubmit = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/payments/${refundModal.payment.bookingId || refundModal.payment._id}/refund`, {
        reason: refundReason,
      });
      toast.success('Refund processed successfully');
      setRefundModal({ open: false, payment: null });
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Refund failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Compute platform commission from payments if not in revenue API
  const totalRevenue    = revenue?.totalRevenue    ?? payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalCommission = revenue?.totalCommission ?? payments.reduce((sum, p) => sum + (p.platformCommission || p.commission || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#1B2B4B]">Payments</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track all transactions and platform earnings</p>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard icon={DollarSign}  label="Total Revenue"          value={formatCurrency(totalRevenue)} />
          <StatCard icon={TrendingUp}  label="Platform Commission"    value={formatCurrency(totalCommission)} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : payments.length === 0 ? (
        <EmptyState icon="💳" title="No payments found" description="Payment records will appear here." />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Payment ID', 'Booking', 'Customer', 'Worker', 'Amount', 'Commission', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">
                      #{(p.razorpayPaymentId || p._id)?.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">
                      #{(p.bookingId?._id || p.bookingId || p.booking)?.toString().slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                      {p.user?.name || p.customer?.name || p.bookingId?.user?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                      {p.worker?.name || p.bookingId?.worker?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                      {p.amount != null ? formatCurrency(p.amount) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {(p.platformCommission ?? p.commission) != null
                        ? formatCurrency(p.platformCommission ?? p.commission)
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${getStatusColor(p.status)}`}>
                        {getStatusLabel(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {p.createdAt ? formatDate(p.createdAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'captured' && (
                        <button
                          onClick={() => { setRefundReason(''); setRefundModal({ open: true, payment: p }); }}
                          className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-semibold hover:bg-orange-100 transition-colors whitespace-nowrap"
                        >
                          Refund
                        </button>
                      )}
                      {p.status === 'refunded' && (
                        <span className="text-xs text-gray-400 italic">Refunded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      <Modal
        isOpen={refundModal.open}
        onClose={() => setRefundModal({ open: false, payment: null })}
        title="Process Refund"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800 font-medium">
              You are about to refund{' '}
              <span className="font-bold">
                {refundModal.payment?.amount != null ? formatCurrency(refundModal.payment.amount) : '—'}
              </span>{' '}
              for Booking #
              {(refundModal.payment?.bookingId?._id || refundModal.payment?.bookingId || refundModal.payment?._id)
                ?.toString().slice(-6).toUpperCase()}.
            </p>
            <p className="text-xs text-orange-700 mt-1">This action cannot be undone.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Refund Reason (optional)</label>
            <textarea
              rows={2}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Customer complaint, service not rendered..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRefundModal({ open: false, payment: null })}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRefundSubmit}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading && <Spinner size="sm" color="white" />}
              Confirm Refund
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
