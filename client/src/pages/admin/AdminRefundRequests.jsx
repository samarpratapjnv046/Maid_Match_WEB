import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  RefreshCw, CheckCircle, X, Banknote, Phone, Mail,
  ChevronRight, AlertCircle, Info,
} from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

// ─── helpers ──────────────────────────────────────────────────────────────────
const serviceLabel = (s) =>
  (s || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Returns the refundable amount: base_amount minus platform_commission */
const refundAmount = (booking) => {
  const price = booking.price || {};
  if (price.worker_payout != null) return Number(price.worker_payout);
  if (price.base_amount != null && price.platform_commission != null)
    return Number(price.base_amount) - Number(price.platform_commission);
  return 0;
};

// ─── Detail + Process panel (shown when a row is selected) ───────────────────
function DetailCard({ booking, onClose, onSuccess }) {
  const [utr,   setUtr]   = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const price          = booking.price || {};
  const totalPaid      = Number(price.base_amount ?? 0);
  const platformFee    = Number(price.platform_commission ?? 0);
  const refundAmt      = refundAmount(booking);
  const commissionPct  = price.commission_rate != null
    ? `${Math.round(price.commission_rate * 100)}%`
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utr.trim()) { toast.error('UTR / reference number is required.'); return; }
    setSubmitting(true);
    try {
      await api.patch(`/admin/refund-requests/${booking._id}/process`, {
        utr_number:  utr.trim(),
        admin_notes: notes.trim(),
      });
      toast.success('Refund processed. Confirmation email sent to customer.');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-xl shadow-2xl max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1B2B4B]">Refund Request</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {booking.user_id?.name} · Booking #{String(booking._id).slice(-8).toUpperCase()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Customer */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-semibold text-[#1B2B4B]">{booking.user_id?.name || '—'}</p>
              <p className="text-gray-500 flex items-center gap-1.5"><Mail size={12} />{booking.user_id?.email || '—'}</p>
              <p className="text-gray-500 flex items-center gap-1.5"><Phone size={12} />{booking.user_id?.phone || 'Not provided'}</p>
            </div>
          </section>

          {/* Booking info */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Booking Details</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <span className="text-gray-500">Service</span>
              <span className="font-medium text-[#1B2B4B]">{serviceLabel(booking.service_type)}</span>
              <span className="text-gray-500">Requested on</span>
              <span className="font-medium text-[#1B2B4B]">{booking.updatedAt ? formatDateTime(booking.updatedAt) : '—'}</span>
              {booking.cancellation_reason && (
                <>
                  <span className="text-gray-500">Reason</span>
                  <span className="font-medium text-gray-700">{booking.cancellation_reason}</span>
                </>
              )}
            </div>
          </section>

          {/* Amount breakdown */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Amount Breakdown</p>
            <div className="border border-gray-100 rounded-xl overflow-hidden text-sm">
              <div className="flex justify-between items-center px-4 py-2.5 bg-gray-50">
                <span className="text-gray-600">Total Paid by Customer</span>
                <span className="font-semibold text-[#1B2B4B]">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 border-t border-gray-100">
                <span className="text-gray-600 flex items-center gap-1.5">
                  Platform Fee
                  {commissionPct && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                      {commissionPct}
                    </span>
                  )}
                  <span className="text-xs text-orange-500 font-medium">(non-refundable)</span>
                </span>
                <span className="font-semibold text-red-500">− {formatCurrency(platformFee)}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 border-t-2 border-[#1B2B4B]/10 bg-green-50">
                <span className="font-bold text-green-800">Refund to Customer</span>
                <span className="font-serif text-xl font-bold text-green-700">{formatCurrency(refundAmt)}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400 flex items-start gap-1.5">
              <Info size={12} className="flex-shrink-0 mt-0.5" />
              Platform fee is retained as service charge. Only the worker payout portion is refunded.
            </p>
          </section>

          {/* Customer bank details */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Banknote size={12} /> Transfer To (Customer's Account)
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs p-4 bg-[#FAF8F3] border border-gray-100 rounded-xl">
              <span className="text-gray-500">Account Holder</span>
              <span className="font-medium text-[#1B2B4B]">{booking.refund_bank_details?.account_holder_name || '—'}</span>
              <span className="text-gray-500">Bank</span>
              <span className="font-medium text-[#1B2B4B]">{booking.refund_bank_details?.bank_name || '—'}</span>
              <span className="text-gray-500">Account No.</span>
              <span className="font-medium text-[#1B2B4B] font-mono">{booking.refund_bank_details?.account_number || '—'}</span>
              <span className="text-gray-500">IFSC</span>
              <span className="font-medium text-[#1B2B4B] font-mono">{booking.refund_bank_details?.ifsc_code || '—'}</span>
            </div>
          </section>

          {/* Process form */}
          <form onSubmit={handleSubmit} className="space-y-3 border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mark as Processed</p>
            <div>
              <label className="block text-sm font-semibold text-[#1B2B4B] mb-1.5">
                UTR / Transaction Reference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. UTR123456789012"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Emailed to the customer for tracking.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1B2B4B] mb-1.5">Admin Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Internal notes…"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] resize-none"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <Spinner size={14} /> : <CheckCircle size={14} />}
                {submitting ? 'Processing…' : 'Confirm Refund Sent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function RefundRow({ booking, index, onClick }) {
  const price       = booking.price || {};
  const totalPaid   = Number(price.base_amount ?? 0);
  const platformFee = Number(price.platform_commission ?? 0);
  const refundAmt   = refundAmount(booking);

  return (
    <tr
      onClick={onClick}
      className="hover:bg-orange-50/60 cursor-pointer transition-colors group"
    >
      <td className="px-4 py-3.5 text-xs text-gray-400 font-mono whitespace-nowrap">{index + 1}</td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <p className="text-sm font-semibold text-[#1B2B4B] group-hover:text-[#C9A84C] transition-colors">
          {booking.user_id?.name || '—'}
        </p>
        <p className="text-xs text-gray-400">{booking.user_id?.email}</p>
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">
        {serviceLabel(booking.service_type)}
      </td>
      <td className="px-4 py-3.5 text-sm text-right whitespace-nowrap font-semibold text-[#1B2B4B]">
        {formatCurrency(totalPaid)}
      </td>
      <td className="px-4 py-3.5 text-sm text-right whitespace-nowrap text-red-500 font-medium">
        − {formatCurrency(platformFee)}
      </td>
      <td className="px-4 py-3.5 text-right whitespace-nowrap">
        <span className="font-serif text-base font-bold text-green-700">{formatCurrency(refundAmt)}</span>
      </td>
      <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
        {booking.updatedAt ? formatDateTime(booking.updatedAt) : '—'}
      </td>
      <td className="px-4 py-3.5 text-right">
        <ChevronRight size={16} className="text-gray-300 group-hover:text-[#C9A84C] transition-colors ml-auto" />
      </td>
    </tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminRefundRequests() {
  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(null);   // booking opened in detail

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/refund-requests');
      setRequests(Array.isArray(data.data) ? data.data : []);
    } catch {
      toast.error('Failed to load refund requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Summary totals
  const totalRefundable = requests.reduce((s, b) => s + refundAmount(b), 0);
  const totalFees       = requests.reduce((s, b) => s + Number(b.price?.platform_commission ?? 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1B2B4B]">Refund Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manually transfer and mark each refund — platform fees are non-refundable
          </p>
        </div>
        {!loading && requests.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full border border-orange-200 flex-shrink-0">
            <RefreshCw size={13} />
            {requests.length} pending
          </span>
        )}
      </div>

      {/* Summary cards */}
      {!loading && requests.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">Total to Refund</p>
            <p className="font-serif text-xl font-bold text-green-700">{formatCurrency(totalRefundable)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">Platform Fees Retained</p>
            <p className="font-serif text-xl font-bold text-[#1B2B4B]">{formatCurrency(totalFees)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">Requests Pending</p>
            <p className="font-serif text-xl font-bold text-orange-600">{requests.length}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1B2B4B] mb-1">All caught up!</h3>
            <p className="text-gray-400 text-sm">No pending refund requests.</p>
          </div>
        ) : (
          <>
            {/* Platform fee note */}
            <div className="flex items-start gap-2 px-5 py-3 bg-amber-50 border-b border-amber-100">
              <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Platform fees are <strong>non-refundable</strong>. The refund amount shown is what must be
                transferred to the customer (total paid minus platform fee).
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Paid</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Platform Fee</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Refund</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Requested</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map((b, i) => (
                    <RefundRow
                      key={b._id}
                      booking={b}
                      index={i}
                      onClick={() => setSelected(b)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Detail card — opens when a row is clicked */}
      {selected && (
        <DetailCard
          booking={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => { setSelected(null); fetchRequests(); }}
        />
      )}
    </div>
  );
}
