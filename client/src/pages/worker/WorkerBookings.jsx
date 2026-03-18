import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  KeyRound,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
  getStatusLabel,
  serviceIcons,
  serviceLabels,
} from '../../utils/helpers';

// ─── Tabs config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all', label: 'All' },
  { key: 'offer_pending', label: 'Pending Offers' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

const EMPTY_STATES = {
  all: { icon: '📋', title: 'No bookings yet', description: 'Your bookings will appear here once customers book you.' },
  offer_pending: { icon: '⏳', title: 'No pending offers', description: 'Customer booking requests waiting for your response.' },
  active: { icon: '✅', title: 'No active bookings', description: 'Accepted and paid bookings will appear here.' },
  completed: { icon: '🏆', title: 'No completed bookings', description: 'Completed jobs will appear here.' },
};

const PAGE_SIZE = 10;

// ─── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
          <div className="h-5 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="h-7 bg-gray-100 rounded" />
        <div className="h-7 bg-gray-100 rounded" />
        <div className="h-7 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ─── Booking card ──────────────────────────────────────────────────────────────
function BookingCard({ booking, onAccept, onOpenReject, onOpenComplete, actionLoading }) {
  const customer = booking.customer || {};
  const photo = customer.profilePhoto?.url;
  const initials = customer.name?.[0]?.toUpperCase() || '?';
  const service = booking.service_type;
  const status = booking.status;
  const amount = booking.totalAmount ?? booking.total_amount ?? booking.price;

  const isPending = status === 'offer_pending';
  const isPaid = status === 'paid';
  const isLoadingAction = actionLoading === booking._id;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all duration-200 ${
      isPending ? 'border-amber-200' : 'border-gray-100 hover:border-[#C9A84C]/25 hover:shadow-md'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0">
          {photo ? (
            <img
              src={photo}
              alt={customer.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1B2B4B] flex items-center justify-center">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-[#1B2B4B] text-sm">{customer.name || 'Customer'}</p>
              {service && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <span role="img" aria-label={serviceLabels[service]}>{serviceIcons[service]}</span>
                  {serviceLabels[service] || service}
                </p>
              )}
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </span>
          </div>
        </div>
      </div>

      {/* Details row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-4">
        {booking.start_time && (
          <span className="flex items-center gap-1">
            <Calendar size={11} className="text-[#C9A84C]" />
            {formatDateTime(booking.start_time)}
          </span>
        )}
        {booking.duration_type && (
          <span className="flex items-center gap-1 capitalize">
            <Clock size={11} className="text-[#C9A84C]" />
            {booking.duration_type}
          </span>
        )}
        {booking.address?.city && (
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-[#C9A84C]" />
            {booking.address.city}
          </span>
        )}
        {amount != null && (
          <span className="ml-auto font-semibold text-[#1B2B4B] text-sm">
            {formatCurrency(amount)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {/* View detail link */}
        <Link
          to={`/worker/bookings/${booking._id}`}
          className="flex items-center gap-1.5 border border-gray-200 hover:border-[#1B2B4B]/40 text-gray-600 hover:text-[#1B2B4B] font-medium px-3 py-2 rounded-lg text-xs transition-colors"
        >
          View Details
          <ChevronRight size={12} />
        </Link>

        {/* Pending offer actions */}
        {isPending && (
          <>
            <button
              onClick={() => onAccept(booking._id)}
              disabled={isLoadingAction}
              className="flex items-center gap-1.5 bg-[#1B2B4B] hover:bg-[#152238] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-3 py-2 rounded-lg text-xs transition-colors"
            >
              {isLoadingAction ? <Spinner size="sm" color="white" /> : <CheckCircle size={12} />}
              Accept
            </button>
            <button
              onClick={() => onOpenReject(booking)}
              disabled={isLoadingAction}
              className="flex items-center gap-1.5 border border-red-200 hover:border-red-400 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed text-red-600 font-semibold px-3 py-2 rounded-lg text-xs transition-colors"
            >
              <XCircle size={12} />
              Reject
            </button>
          </>
        )}

        {/* Complete with OTP */}
        {isPaid && (
          <button
            onClick={() => onOpenComplete(booking)}
            disabled={isLoadingAction}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-3 py-2 rounded-lg text-xs transition-colors"
          >
            <KeyRound size={12} />
            Complete with OTP
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function WorkerBookings() {
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [actionLoading, setActionLoading] = useState(null);

  // Reject modal
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Complete OTP modal
  const [otpModal, setOtpModal] = useState(false);
  const [otpTarget, setOtpTarget] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // ─── Fetch bookings ─────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (tab, pageNum) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pageNum);
      params.set('limit', PAGE_SIZE);

      if (tab === 'offer_pending') {
        params.set('status', 'offer_pending');
      } else if (tab === 'active') {
        params.set('status', 'accepted,paid');
      } else if (tab === 'completed') {
        params.set('status', 'completed');
      }

      const { data } = await api.get(`/bookings?${params.toString()}`);
      const list = data.data?.bookings || data.data || data.bookings || [];
      const total = data.data?.totalPages || data.totalPages || 1;
      setBookings(Array.isArray(list) ? list : []);
      setTotalPages(total);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load bookings.';
      toast.error(msg);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchBookings(activeTab, page);
  }, [activeTab, page, fetchBookings]);

  // ─── Accept ─────────────────────────────────────────────────────────────────
  async function handleAccept(bookingId) {
    setActionLoading(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/respond`, { action: 'accept' });
      toast.success('Booking accepted!');
      fetchBookings(activeTab, page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to accept booking.');
    } finally {
      setActionLoading(null);
    }
  }

  // ─── Open reject modal ──────────────────────────────────────────────────────
  function openRejectModal(booking) {
    setRejectTarget(booking);
    setRejectReason('');
    setRejectModal(true);
  }

  // ─── Submit rejection ────────────────────────────────────────────────────────
  async function handleRejectSubmit() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    setRejectLoading(true);
    try {
      await api.patch(`/bookings/${rejectTarget._id}/respond`, {
        action: 'reject',
        rejection_reason: rejectReason.trim(),
      });
      toast.success('Booking rejected.');
      setRejectModal(false);
      setRejectTarget(null);
      setRejectReason('');
      fetchBookings(activeTab, page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject booking.');
    } finally {
      setRejectLoading(false);
    }
  }

  // ─── Open OTP modal ─────────────────────────────────────────────────────────
  function openOtpModal(booking) {
    setOtpTarget(booking);
    setOtp('');
    setOtpModal(true);
  }

  // ─── Submit OTP completion ──────────────────────────────────────────────────
  async function handleOtpSubmit() {
    if (!otpTarget) return;
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }
    setOtpLoading(true);
    try {
      await api.post(`/bookings/${otpTarget._id}/complete`, { otp: otp.trim() });
      toast.success('Booking marked as completed!');
      setOtpModal(false);
      setOtpTarget(null);
      setOtp('');
      fetchBookings(activeTab, page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid OTP or failed to complete booking.');
    } finally {
      setOtpLoading(false);
    }
  }

  const empty = EMPTY_STATES[activeTab] || EMPTY_STATES.all;

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <div className="bg-[#1B2B4B] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest mb-2">
            Worker Portal
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">My Bookings</h1>
          <p className="mt-2 text-gray-400 text-sm">
            Manage all your booking requests and jobs
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab.key
                  ? 'bg-[#1B2B4B] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#1B2B4B] hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="text-5xl mb-4">{empty.icon}</div>
            <h3 className="font-serif text-xl font-semibold text-[#1B2B4B] mb-2">{empty.title}</h3>
            <p className="text-gray-500 text-sm max-w-xs">{empty.description}</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onAccept={handleAccept}
                  onOpenReject={openRejectModal}
                  onOpenComplete={openOtpModal}
                  actionLoading={actionLoading}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-[#1B2B4B]/40 text-gray-600 hover:text-[#1B2B4B] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page <strong className="text-[#1B2B4B]">{page}</strong> of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-[#1B2B4B]/40 text-gray-600 hover:text-[#1B2B4B] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Reject Modal ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={rejectModal}
        onClose={() => {
          if (!rejectLoading) {
            setRejectModal(false);
            setRejectTarget(null);
            setRejectReason('');
          }
        }}
        title="Reject Booking"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Reject booking from {rejectTarget?.customer?.name || 'this customer'}?</p>
              <p className="text-xs text-red-600 mt-0.5">Please provide a reason — the customer will be notified.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1B2B4B] mb-1.5">
              Rejection reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="e.g. Not available on this date, outside service area…"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setRejectModal(false); setRejectTarget(null); setRejectReason(''); }}
              disabled={rejectLoading}
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectSubmit}
              disabled={rejectLoading || !rejectReason.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {rejectLoading ? <><Spinner size="sm" color="white" /> Rejecting…</> : 'Reject Booking'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── OTP Completion Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={otpModal}
        onClose={() => {
          if (!otpLoading) {
            setOtpModal(false);
            setOtpTarget(null);
            setOtp('');
          }
        }}
        title="Complete Booking with OTP"
        size="sm"
      >
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Completing job for {otpTarget?.customer?.name || 'customer'}</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Ask the customer for the OTP they received. Enter it below to mark the booking complete.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1B2B4B] mb-1.5 flex items-center gap-2">
              <KeyRound size={14} className="text-[#C9A84C]" />
              Customer OTP (6 digits) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(val);
              }}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-colors bg-[#FAF8F3]"
            />
            <p className="text-xs text-gray-400 text-center mt-2">
              {otp.length}/6 digits entered
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setOtpModal(false); setOtpTarget(null); setOtp(''); }}
              disabled={otpLoading}
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleOtpSubmit}
              disabled={otpLoading || otp.length !== 6}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {otpLoading ? (
                <><Spinner size="sm" color="white" /> Verifying…</>
              ) : (
                <><CheckCircle size={14} /> Complete Booking</>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
