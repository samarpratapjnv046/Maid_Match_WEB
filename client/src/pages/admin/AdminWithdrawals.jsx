import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  ChevronDown,
  X,
} from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: AlertCircle },
  completed:  { label: 'Completed',  color: 'bg-green-100 text-green-700 border-green-200',    icon: CheckCircle },
  rejected:   { label: 'Rejected',   color: 'bg-red-100 text-red-700 border-red-200',          icon: XCircle },
};

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${s.color}`}>
      <Icon size={11} />
      {s.label}
    </span>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'text-[#1B2B4B]' }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold font-serif ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Approve modal ─────────────────────────────────────────────────────────────
function ApproveModal({ withdrawal, onClose, onSuccess }) {
  const [utr, setUtr] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utr.trim()) { toast.error('UTR/Reference number is required.'); return; }
    setSubmitting(true);
    try {
      await api.patch(`/admin/withdrawals/${withdrawal._id}/approve`, {
        utr_number: utr.trim(),
        admin_notes: notes.trim(),
      });
      toast.success('Withdrawal approved and marked as completed.');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve withdrawal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1B2B4B]">Approve Withdrawal</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {withdrawal.worker_id?.user_id?.name} · {formatCurrency(withdrawal.amount)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Bank snapshot */}
          <div className="p-4 bg-[#FAF8F3] rounded-xl text-sm space-y-1.5">
            <p className="font-semibold text-[#1B2B4B] text-xs uppercase tracking-wider mb-2">Transfer To</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <span className="text-gray-500">Account Holder</span>
              <span className="font-medium text-[#1B2B4B]">{withdrawal.bank_snapshot?.account_holder_name || '—'}</span>
              <span className="text-gray-500">Bank</span>
              <span className="font-medium text-[#1B2B4B]">{withdrawal.bank_snapshot?.bank_name || '—'}</span>
              <span className="text-gray-500">Account No.</span>
              <span className="font-medium text-[#1B2B4B] font-mono">{withdrawal.bank_snapshot?.account_number || '—'}</span>
              <span className="text-gray-500">IFSC</span>
              <span className="font-medium text-[#1B2B4B] font-mono">{withdrawal.bank_snapshot?.ifsc_code || '—'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1B2B4B] mb-1.5">UTR / Reference Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="e.g. UTR123456789"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
              required
            />
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
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Spinner size={14} /> : <CheckCircle size={14} />}
              {submitting ? 'Approving…' : 'Approve & Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Reject modal ─────────────────────────────────────────────────────────────
function RejectModal({ withdrawal, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { toast.error('Please provide a rejection reason.'); return; }
    setSubmitting(true);
    try {
      await api.patch(`/admin/withdrawals/${withdrawal._id}/reject`, { rejection_reason: reason.trim() });
      toast.success('Withdrawal rejected. Amount refunded to worker wallet.');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject withdrawal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1B2B4B]">Reject Withdrawal</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {withdrawal.worker_id?.user_id?.name} · {formatCurrency(withdrawal.amount)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">
              Rejecting this withdrawal will refund <strong>{formatCurrency(withdrawal.amount)}</strong> back to the worker's wallet.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1B2B4B] mb-1.5">Rejection Reason <span className="text-red-500">*</span></label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Invalid bank account details, account closed…"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Spinner size={14} /> : <XCircle size={14} />}
              {submitting ? 'Rejecting…' : 'Reject & Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Withdrawal row ────────────────────────────────────────────────────────────
function WithdrawalRow({ w, onApprove, onReject, onMarkProcessing }) {
  const isPending    = w.status === 'pending';
  const isProcessing = w.status === 'processing';
  const isActionable = isPending || isProcessing;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Worker info */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#1B2B4B]/5 flex items-center justify-center flex-shrink-0">
            <Banknote size={18} className="text-[#1B2B4B]" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#1B2B4B] text-sm truncate">
              {w.worker_id?.user_id?.name || 'Unknown Worker'}
            </p>
            <p className="text-xs text-gray-400 truncate">{w.worker_id?.user_id?.email || ''}</p>
            <p className="text-xs text-gray-400 mt-0.5">{w.createdAt ? formatDateTime(w.createdAt) : '—'}</p>
          </div>
        </div>

        {/* Amount + status */}
        <div className="flex items-center gap-3 sm:flex-col sm:items-end flex-shrink-0">
          <p className="font-serif text-xl font-bold text-[#1B2B4B]">{formatCurrency(w.amount)}</p>
          <StatusBadge status={w.status} />
        </div>
      </div>

      {/* Bank details */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-gray-400 mb-0.5">Account Holder</p>
          <p className="font-medium text-gray-700 truncate">{w.bank_snapshot?.account_holder_name || '—'}</p>
        </div>
        <div>
          <p className="text-gray-400 mb-0.5">Bank</p>
          <p className="font-medium text-gray-700 truncate">{w.bank_snapshot?.bank_name || '—'}</p>
        </div>
        <div>
          <p className="text-gray-400 mb-0.5">Account No.</p>
          <p className="font-medium text-gray-700 font-mono">{w.bank_snapshot?.account_number || '—'}</p>
        </div>
        <div>
          <p className="text-gray-400 mb-0.5">IFSC</p>
          <p className="font-medium text-gray-700 font-mono">{w.bank_snapshot?.ifsc_code || '—'}</p>
        </div>
      </div>

      {/* UTR / rejection reason */}
      {w.utr_number && (
        <p className="mt-2 text-xs text-gray-500">UTR: <span className="font-mono font-medium">{w.utr_number}</span></p>
      )}
      {w.rejection_reason && (
        <p className="mt-2 text-xs text-red-500">Rejected: {w.rejection_reason}</p>
      )}
      {w.admin_notes && (
        <p className="mt-1 text-xs text-gray-400">Notes: {w.admin_notes}</p>
      )}

      {/* Action buttons */}
      {isActionable && (
        <div className="mt-4 flex flex-wrap gap-2">
          {isPending && (
            <button
              onClick={() => onMarkProcessing(w)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <AlertCircle size={13} />
              Mark Processing
            </button>
          )}
          <button
            onClick={() => onApprove(w)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors border border-green-200"
          >
            <CheckCircle size={13} />
            Approve & Complete
          </button>
          <button
            onClick={() => onReject(w)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors border border-red-200"
          >
            <XCircle size={13} />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
const STATUS_FILTERS = ['all', 'pending', 'processing', 'completed', 'rejected'];

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null); // id being actioned

  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal,  setRejectModal]  = useState(null);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/admin/withdrawals', { params });
      setWithdrawals(Array.isArray(data.data) ? data.data : []);
    } catch {
      toast.error('Failed to load withdrawals.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  const handleMarkProcessing = async (w) => {
    setActionLoading(w._id);
    try {
      await api.patch(`/admin/withdrawals/${w._id}/processing`);
      toast.success('Marked as processing.');
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Derived stats ─────────────────────────────────────────────────────────
  const pending    = withdrawals.filter((w) => w.status === 'pending').length;
  const processing = withdrawals.filter((w) => w.status === 'processing').length;
  const totalPendingAmount = withdrawals
    .filter((w) => w.status === 'pending' || w.status === 'processing')
    .reduce((s, w) => s + w.amount, 0);

  // ─── Client-side search (by worker name / email) ───────────────────────────
  const filtered = withdrawals.filter((w) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name  = (w.worker_id?.user_id?.name  || '').toLowerCase();
    const email = (w.worker_id?.user_id?.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#1B2B4B]">Withdrawal Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Review and process worker payout requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Pending" value={pending} sub="Awaiting action" color="text-yellow-600" />
        <StatCard label="Processing" value={processing} sub="In progress" color="text-blue-600" />
        <StatCard label="Total Pending Amount" value={formatCurrency(totalPendingAmount)} sub="Pending + Processing" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by worker name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] bg-white"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none w-full sm:w-44 px-4 py-2.5 pr-9 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] bg-white text-[#1B2B4B] font-medium capitalize cursor-pointer"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s} className="capitalize">{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Banknote size={28} className="text-gray-300" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-[#1B2B4B] mb-2">No withdrawal requests</h3>
          <p className="text-gray-400 text-sm max-w-xs">
            {search ? 'No results match your search.' : 'No withdrawal requests found for the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((w) => (
            <WithdrawalRow
              key={w._id}
              w={w}
              onApprove={setApproveModal}
              onReject={setRejectModal}
              onMarkProcessing={handleMarkProcessing}
            />
          ))}
        </div>
      )}

      {/* Approve modal */}
      {approveModal && (
        <ApproveModal
          withdrawal={approveModal}
          onClose={() => setApproveModal(null)}
          onSuccess={() => { setApproveModal(null); fetchWithdrawals(); }}
        />
      )}

      {/* Reject modal */}
      {rejectModal && (
        <RejectModal
          withdrawal={rejectModal}
          onClose={() => setRejectModal(null)}
          onSuccess={() => { setRejectModal(null); fetchWithdrawals(); }}
        />
      )}
    </div>
  );
}
