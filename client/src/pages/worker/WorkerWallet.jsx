import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

// ─── Skeleton rows ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3.5">
        <div className="h-3.5 bg-gray-200 rounded w-28" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3.5 bg-gray-200 rounded w-40" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="h-4 bg-gray-200 rounded w-20 ml-auto" />
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="h-3.5 bg-gray-100 rounded w-24 ml-auto" />
      </td>
    </tr>
  );
}

// ─── Balance card ──────────────────────────────────────────────────────────────
function BalanceCard({ balance, loading, onWithdraw }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-7 shadow-lg text-white"
      style={{
        background: 'linear-gradient(135deg, #1B2B4B 0%, #243a63 50%, #1B2B4B 100%)',
      }}
    >
      {/* Gold accent overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 80% 20%, #C9A84C 0%, transparent 60%), radial-gradient(circle at 20% 80%, #C9A84C 0%, transparent 50%)',
        }}
      />
      {/* Pattern dots */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest mb-1">
              Available Balance
            </p>
            <p className="text-gray-400 text-xs">Worker Wallet</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/30 flex items-center justify-center">
            <Wallet size={22} className="text-[#C9A84C]" />
          </div>
        </div>

        {loading ? (
          <div className="h-12 w-48 bg-white/10 rounded-xl animate-pulse" />
        ) : (
          <p className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
            {formatCurrency(balance ?? 0)}
          </p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={onWithdraw}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#1B2B4B] text-sm font-semibold hover:bg-[#b8973e] active:scale-[0.97] transition-all disabled:opacity-50"
          >
            <Banknote size={16} />
            Withdraw Funds
          </button>
        </div>

        <p className="text-gray-400 text-xs mt-3">
          Earnings are credited after booking completion
        </p>
      </div>
    </div>
  );
}

// ─── Transaction type badge ────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const isCredit = type === 'credit';
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${
        isCredit
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {isCredit ? (
        <><ArrowDownLeft size={10} /> Credit</>
      ) : (
        <><ArrowUpRight size={10} /> Debit</>
      )}
    </span>
  );
}

// ─── Withdrawal status badge ──────────────────────────────────────────────────
const WITHDRAWAL_STATUS = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700',    icon: AlertCircle },
  completed:  { label: 'Completed',  color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  rejected:   { label: 'Rejected',   color: 'bg-red-100 text-red-700',      icon: XCircle },
};

function WithdrawalStatusBadge({ status }) {
  const s = WITHDRAWAL_STATUS[status] || WITHDRAWAL_STATUS.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${s.color}`}>
      <Icon size={11} />
      {s.label}
    </span>
  );
}

// ─── Withdraw modal ───────────────────────────────────────────────────────────
function WithdrawModal({ balance, bankVerified, bankDetails, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!parsed || parsed < 100) {
      toast.error('Minimum withdrawal amount is ₹100.');
      return;
    }
    if (parsed > balance) {
      toast.error(`Insufficient balance. Available: ${formatCurrency(balance)}`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/wallet/withdraw', { amount: parsed });
      toast.success('Withdrawal request submitted successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit withdrawal request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1B2B4B]">Withdraw Funds</h2>
            <p className="text-xs text-gray-500 mt-0.5">Transfer to your registered bank account</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {!bankVerified ? (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Bank Account Not Verified</p>
                <p className="text-xs text-amber-700 mt-1">
                  Please add and verify your bank account in your profile before requesting a withdrawal.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Available balance */}
              <div className="flex items-center justify-between p-4 bg-[#FAF8F3] rounded-xl border border-gray-100">
                <span className="text-sm text-gray-600">Available balance</span>
                <span className="font-serif text-xl font-bold text-[#1B2B4B]">{formatCurrency(balance)}</span>
              </div>

              {/* Bank account (read-only) */}
              {bankDetails && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Transfer To</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <span className="text-gray-500">Account Holder</span>
                    <span className="font-medium text-[#1B2B4B] text-right">{bankDetails.account_holder_name || '—'}</span>
                    <span className="text-gray-500">Bank</span>
                    <span className="font-medium text-[#1B2B4B] text-right">{bankDetails.bank_name || '—'}</span>
                    <span className="text-gray-500">Account No.</span>
                    <span className="font-medium text-[#1B2B4B] text-right font-mono">
                      {'•'.repeat(Math.max(0, (bankDetails.account_number || '').length - 4))}
                      {(bankDetails.account_number || '').slice(-4)}
                    </span>
                    <span className="text-gray-500">IFSC</span>
                    <span className="font-medium text-[#1B2B4B] text-right font-mono">{bankDetails.ifsc_code || '—'}</span>
                  </div>
                </div>
              )}

              {/* Amount input */}
              <div>
                <label className="block text-sm font-semibold text-[#1B2B4B] mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">₹</span>
                  <input
                    type="number"
                    min="100"
                    max={balance}
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Minimum ₹100 · Maximum {formatCurrency(balance)}</p>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                <AlertCircle size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Funds will be transferred to your bank account within 1–3 business days after admin approval.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#1B2B4B] text-white text-sm font-semibold hover:bg-[#243a63] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <Spinner size={16} /> : <Banknote size={16} />}
                {submitting ? 'Submitting…' : 'Submit Withdrawal Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── How You Get Paid info ────────────────────────────────────────────────────
function HowYouGetPaid() {
  const [open, setOpen] = useState(false);
  const steps = [
    { label: 'Complete a Booking', desc: 'Finish the service and mark it complete. The customer then pays.' },
    { label: 'Earnings Credited', desc: 'After payment, your share is automatically added to your wallet balance.' },
    { label: 'Request Withdrawal', desc: 'Once you have ₹100 or more, tap "Withdraw Funds" to request a bank transfer.' },
    { label: 'Admin Approves', desc: 'Our team reviews and approves the request, usually within 1 business day.' },
    { label: 'Bank Transfer', desc: 'Funds are transferred to your verified bank account within 1–3 business days.' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/15 flex items-center justify-center">
            <Banknote size={16} className="text-[#C9A84C]" />
          </div>
          <span className="font-serif text-base font-semibold text-[#1B2B4B]">How You Get Paid</span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="mt-4 space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-[#1B2B4B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-semibold text-[#1B2B4B]">{step.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Withdrawal history row ───────────────────────────────────────────────────
function WithdrawalRow({ w }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#1B2B4B]/5 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Banknote size={15} className="text-[#1B2B4B]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1B2B4B]">
            Bank Transfer · {w.bank_snapshot?.bank_name || 'Bank'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {w.createdAt ? formatDateTime(w.createdAt) : '—'}
          </p>
          {w.utr_number && (
            <p className="text-xs text-gray-400 mt-0.5 font-mono">UTR: {w.utr_number}</p>
          )}
          {w.rejection_reason && (
            <p className="text-xs text-red-500 mt-0.5">Reason: {w.rejection_reason}</p>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <p className="font-semibold text-[#1B2B4B] text-sm">{formatCurrency(w.amount)}</p>
        <div className="mt-1">
          <WithdrawalStatusBadge status={w.status} />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function WorkerWallet() {
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [wdLoading, setWdLoading] = useState(true);
  const [bankVerified, setBankVerified] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // ─── Fetch wallet balance ──────────────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const { data } = await api.get('/wallet');
      setBalance(data.data?.wallet_balance ?? 0);
    } catch {
      toast.error('Failed to load wallet balance.');
      setBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  // ─── Fetch transactions ────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const { data } = await api.get('/wallet/transactions');
      const list = data.data?.transactions || data.transactions || data.data || [];
      setTransactions(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load transaction history.');
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, []);

  // ─── Fetch withdrawals ─────────────────────────────────────────────────────
  const fetchWithdrawals = useCallback(async () => {
    setWdLoading(true);
    try {
      const { data } = await api.get('/wallet/withdrawals');
      setWithdrawals(Array.isArray(data.data) ? data.data : []);
    } catch {
      setWithdrawals([]);
    } finally {
      setWdLoading(false);
    }
  }, []);

  const [bankDetails, setBankDetails] = useState(null);

  // ─── Fetch bank status ─────────────────────────────────────────────────────
  const fetchBankStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/workers/profile/me');
      setBankVerified(!!data.data?.bank_details?.is_verified);
      setBankDetails(data.data?.bank_details || null);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    fetchWithdrawals();
    fetchBankStatus();
  }, [fetchBalance, fetchTransactions, fetchWithdrawals, fetchBankStatus]);

  // ─── Computed stats ────────────────────────────────────────────────────────
  const totalCredits = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + (t.amount || 0), 0);
  const totalDebits  = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + (t.amount || 0), 0);

  const handleWithdrawSuccess = () => {
    setShowWithdrawModal(false);
    fetchBalance();
    fetchWithdrawals();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-[#1B2B4B] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest mb-2">
            Worker Portal
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">My Wallet</h1>
          <p className="mt-2 text-gray-400 text-sm">Track your earnings and transaction history</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Balance card */}
        <BalanceCard balance={balance} loading={balanceLoading} onWithdraw={() => setShowWithdrawModal(true)} />

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={16} className="text-green-600" />
              </div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Earned</p>
            </div>
            {txLoading ? (
              <div className="h-7 w-28 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="font-serif text-2xl font-bold text-[#1B2B4B]">{formatCurrency(totalCredits)}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">All time credits</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <TrendingDown size={16} className="text-red-500" />
              </div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Debited</p>
            </div>
            {txLoading ? (
              <div className="h-7 w-28 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="font-serif text-2xl font-bold text-[#1B2B4B]">{formatCurrency(totalDebits)}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">All time debits</p>
          </div>
        </div>

        {/* How You Get Paid */}
        <HowYouGetPaid />

        {/* Withdrawal History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-serif text-base font-semibold text-[#1B2B4B]">Withdrawal Requests</h2>
            {!wdLoading && withdrawals.length > 0 && (
              <span className="text-xs text-gray-400">{withdrawals.length} request{withdrawals.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {wdLoading ? (
            <div className="px-5 py-8 flex justify-center">
              <Spinner />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <Banknote size={24} className="text-gray-300" />
              </div>
              <p className="font-serif text-base font-semibold text-[#1B2B4B] mb-1">No withdrawals yet</p>
              <p className="text-gray-400 text-sm max-w-xs">
                Your withdrawal requests will appear here.
              </p>
            </div>
          ) : (
            <div className="px-5 divide-y divide-gray-50">
              {withdrawals.map((w) => (
                <WithdrawalRow key={w._id} w={w} />
              ))}
            </div>
          )}
        </div>

        {/* Transaction history */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-serif text-base font-semibold text-[#1B2B4B]">Transaction History</h2>
            {!txLoading && transactions.length > 0 && (
              <span className="text-xs text-gray-400">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {txLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Wallet size={28} className="text-gray-300" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1B2B4B] mb-2">No transactions yet</h3>
              <p className="text-gray-400 text-sm max-w-xs">
                Your earnings will appear here after customers complete and pay for bookings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx, idx) => {
                    const isCredit = tx.type === 'credit';
                    return (
                      <tr key={tx._id || idx} className="hover:bg-[#FAF8F3]/60 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-gray-600 text-xs">
                            {tx.createdAt ? formatDateTime(tx.createdAt) : '—'}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="text-[#1B2B4B] font-medium text-sm truncate">
                            {tx.description || tx.note || 'Transaction'}
                          </p>
                          {tx.reference && (
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">
                              Ref: {String(tx.reference).slice(-8).toUpperCase()}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <TypeBadge type={tx.type} />
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className={`font-semibold text-sm ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                            {isCredit ? '+' : '−'}{formatCurrency(tx.amount || 0)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="text-gray-500 text-xs">
                            {tx.balanceAfter != null
                              ? formatCurrency(tx.balanceAfter)
                              : tx.balance_after != null
                              ? formatCurrency(tx.balance_after)
                              : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center pb-4">
          Transactions are processed automatically. Contact{' '}
          <a href="mailto:support@maidmatch.in" className="text-[#C9A84C] hover:underline font-medium">
            support@maidmatch.in
          </a>{' '}
          for any discrepancies.
        </p>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          balance={balance ?? 0}
          bankVerified={bankVerified}
          bankDetails={bankDetails}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={handleWithdrawSuccess}
        />
      )}
    </div>
  );
}
