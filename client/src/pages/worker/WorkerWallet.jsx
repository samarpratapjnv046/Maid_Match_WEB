import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
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
function BalanceCard({ balance, loading }) {
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

// ─── Main component ────────────────────────────────────────────────────────────
export default function WorkerWallet() {
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);

  // ─── Fetch wallet balance ────────────────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const { data } = await api.get('/wallet');
      const bal = data.data?.balance ?? data.balance ?? data.data ?? 0;
      setBalance(typeof bal === 'object' ? bal.balance ?? 0 : bal);
    } catch (err) {
      toast.error('Failed to load wallet balance.');
      setBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  // ─── Fetch transactions ──────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const { data } = await api.get('/wallet/transactions');
      const list =
        data.data?.transactions ||
        data.transactions ||
        data.data ||
        [];
      setTransactions(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error('Failed to load transaction history.');
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  // ─── Computed stats ──────────────────────────────────────────────────────────
  const totalCredits = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalDebits = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
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
        <BalanceCard balance={balance} loading={balanceLoading} />

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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Balance After
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx, idx) => {
                    const isCredit = tx.type === 'credit';
                    return (
                      <tr
                        key={tx._id || idx}
                        className="hover:bg-[#FAF8F3]/60 transition-colors"
                      >
                        {/* Date */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-gray-600 text-xs">
                            {tx.createdAt ? formatDateTime(tx.createdAt) : '—'}
                          </p>
                        </td>

                        {/* Description */}
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

                        {/* Type badge */}
                        <td className="px-4 py-3.5">
                          <TypeBadge type={tx.type} />
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className={`font-semibold text-sm ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                            {isCredit ? '+' : '−'}{formatCurrency(tx.amount || 0)}
                          </span>
                        </td>

                        {/* Balance after */}
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
          <a href="mailto:support@maidease.in" className="text-[#C9A84C] hover:underline font-medium">
            support@maidease.in
          </a>{' '}
          for any discrepancies.
        </p>
      </div>
    </div>
  );
}
