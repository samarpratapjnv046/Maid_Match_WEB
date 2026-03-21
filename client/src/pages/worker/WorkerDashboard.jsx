import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  CalendarCheck,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  ChevronRight,
  AlertCircle,
  User,
  Briefcase,
  MapPin,
  Calendar,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import StarRating from '../../components/common/StarRating';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
  getStatusLabel,
  serviceIcons,
  serviceLabels,
} from '../../utils/helpers';

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'gold', loading }) {
  const colorMap = {
    gold: 'bg-[#C9A84C]/10 text-[#C9A84C]',
    navy: 'bg-[#1B2B4B]/10 text-[#1B2B4B]',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{label}</p>
          {loading ? (
            <div className="h-7 w-24 bg-gray-100 rounded animate-pulse mt-1" />
          ) : (
            <p className="font-serif text-2xl font-bold text-[#1B2B4B]">{value}</p>
          )}
          {sub && !loading && (
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton booking card ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
          <div className="h-5 w-20 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-9 flex-1 bg-gray-100 rounded-lg" />
        <div className="h-9 flex-1 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Pending request card ─────────────────────────────────────────────────────
function PendingRequestCard({ booking, onAccept, onReject, actionLoading }) {
  const { t } = useTranslation();
  const customer = booking.user_id || {};
  const photo = customer.profilePhoto?.url;
  const initials = customer.name?.[0]?.toUpperCase() || '?';
  const service = booking.service_type;
  const amount = booking.price?.base_amount;

  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
      {/* Customer info */}
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
          <p className="font-semibold text-[#1B2B4B] text-sm">{customer.name || t('worker.customer')}</p>
          {service && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <span role="img" aria-label={serviceLabels[service]}>{serviceIcons[service]}</span>
              {serviceLabels[service] || service}
            </p>
          )}
          <span className="inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800">
            {t('worker.offerPending')}
          </span>
        </div>
        {amount != null && (
          <div className="text-right flex-shrink-0">
            <p className="font-serif text-lg font-bold text-[#1B2B4B]">{formatCurrency(amount)}</p>
          </div>
        )}
      </div>

      {/* Details */}
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
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onAccept(booking._id)}
          disabled={actionLoading === booking._id}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#1B2B4B] hover:bg-[#152238] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-150"
        >
          {actionLoading === booking._id ? (
            <Spinner size="sm" color="white" />
          ) : (
            <>
              <CheckCircle size={14} />
              {t('worker.accept')}
            </>
          )}
        </button>
        <button
          onClick={() => onReject(booking)}
          disabled={actionLoading === booking._id}
          className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 hover:border-red-400 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed text-red-600 font-semibold py-2.5 rounded-lg text-sm transition-all duration-150"
        >
          <XCircle size={14} />
          {t('worker.reject')}
        </button>
      </div>
    </div>
  );
}

// ─── Recent booking row ───────────────────────────────────────────────────────
function RecentBookingRow({ booking }) {
  const { t } = useTranslation();
  const customer = booking.user_id || {};
  const service = booking.service_type;
  const status = booking.status;
  const amount = booking.price?.base_amount;

  return (
    <Link
      to={`/worker/bookings`}
      className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors group"
    >
      <div className="flex-shrink-0">
        {customer.profilePhoto?.url ? (
          <img
            src={customer.profilePhoto.url}
            alt={customer.name}
            className="w-9 h-9 rounded-full object-cover border border-gray-100"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#1B2B4B]/10 flex items-center justify-center">
            <span className="text-[#1B2B4B] font-bold text-xs">
              {customer.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1B2B4B] truncate">{customer.name || t('worker.customer')}</p>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          {service && <span>{serviceIcons[service]}</span>}
          {serviceLabels[service] || service}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(status)}`}>
          {getStatusLabel(status)}
        </span>
        {amount != null && (
          <p className="text-xs font-semibold text-[#1B2B4B] mt-1">{formatCurrency(amount)}</p>
        )}
      </div>
      <ChevronRight size={14} className="text-gray-300 group-hover:text-[#C9A84C] transition-colors flex-shrink-0" />
    </Link>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [workerProfile, setWorkerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [bookingStats, setBookingStats] = useState({ active: 0, completed: 0 });

  const [actionLoading, setActionLoading] = useState(null); // booking._id being acted on
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Reject modal
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null); // booking object
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // ─── Fetch worker profile ──────────────────────────────────────────────────
  const fetchWorkerProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const { data } = await api.get('/workers/profile/me');
      const profile = data.data?.worker || data.data || data.worker || data;
      setWorkerProfile(profile);
    } catch (err) {
      if (err?.response?.status === 404) {
        setWorkerProfile(null);
      } else {
        toast.error('Failed to load worker profile.');
      }
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // ─── Fetch wallet ──────────────────────────────────────────────────────────
  const fetchWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const { data } = await api.get('/wallet');
      setWalletBalance(data.data?.wallet_balance ?? 0);
    } catch {
      setWalletBalance(0);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  // ─── Fetch pending bookings ────────────────────────────────────────────────
  const fetchPendingBookings = useCallback(async () => {
    setPendingLoading(true);
    try {
      const { data } = await api.get('/bookings?status=offer_pending');
      const list = data.data?.bookings || data.data || data.bookings || [];
      setPendingBookings(Array.isArray(list) ? list : []);
    } catch {
      setPendingBookings([]);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  // ─── Fetch recent bookings + active/completed counts ──────────────────────
  const fetchRecentBookings = useCallback(async () => {
    setRecentLoading(true);
    try {
      const [activeRes, completedRes, recentRes] = await Promise.all([
        api.get('/bookings?status=accepted,pending_payment,paid&limit=1'),
        api.get('/bookings?status=completed&limit=1'),
        api.get('/bookings?limit=10'),
      ]);
      setBookingStats({
        active: activeRes.data?.total ?? 0,
        completed: completedRes.data?.total ?? 0,
      });
      const list = recentRes.data?.data || recentRes.data?.bookings || recentRes.data || [];
      const arr = Array.isArray(list) ? list : [];
      const filtered = arr.filter((b) => b.status !== 'offer_pending').slice(0, 5);
      setRecentBookings(filtered);
    } catch {
      setRecentBookings([]);
    } finally {
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkerProfile();
    fetchWallet();
    fetchPendingBookings();
    fetchRecentBookings();
  }, [fetchWorkerProfile, fetchWallet, fetchPendingBookings, fetchRecentBookings]);

  // ─── Toggle availability ───────────────────────────────────────────────────
  async function handleToggleAvailability() {
    setAvailabilityLoading(true);
    try {
      const { data } = await api.patch('/workers/profile/availability');
      setWorkerProfile((prev) => ({ ...prev, is_available: data.is_available }));
      toast.success(data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update availability.');
    } finally {
      setAvailabilityLoading(false);
    }
  }

  // ─── Accept booking ────────────────────────────────────────────────────────
  async function handleAccept(bookingId) {
    setActionLoading(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/respond`, { action: 'accept' });
      toast.success('Booking accepted successfully!');
      fetchPendingBookings();
      fetchRecentBookings();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to accept booking.';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  }

  // ─── Open reject modal ─────────────────────────────────────────────────────
  function openRejectModal(booking) {
    setRejectTarget(booking);
    setRejectReason('');
    setRejectModal(true);
  }

  // ─── Submit rejection ──────────────────────────────────────────────────────
  async function handleRejectSubmit() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection.');
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
      fetchPendingBookings();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to reject booking.';
      toast.error(msg);
    } finally {
      setRejectLoading(false);
    }
  }

  // ─── Derived stats ─────────────────────────────────────────────────────────
  const profileExists = !profileLoading && workerProfile !== null;
  const verificationStatus = workerProfile?.verification_status || 'pending';
  const isVerified = verificationStatus === 'verified';
  const isAvailable = workerProfile?.is_available ?? true;
  const totalBookings = workerProfile?.total_bookings ?? recentBookings.length;
  const rating = workerProfile?.rating || 0;
  const totalReviews = workerProfile?.total_reviews || 0;

  // Profile completeness
  const completenessItems = [
    { label: t('worker.profilePhoto'), done: !!workerProfile?.profilePhoto?.url },
    { label: t('worker.bioAdded'), done: !!workerProfile?.bio },
    { label: t('worker.servicesSelected'), done: (workerProfile?.services || []).length > 0 },
    { label: t('worker.pricingSet'), done: !!(workerProfile?.pricing?.hourly || workerProfile?.pricing?.daily) },
    { label: t('worker.locationAdded'), done: !!(workerProfile?.location?.city || workerProfile?.city) },
  ];
  const completedItems = completenessItems.filter((i) => i.done).length;
  const completenessPercent = Math.round((completedItems / completenessItems.length) * 100);

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* ─── Hero banner ────────────────────────────────────────────────────── */}
      <div className="bg-[#1B2B4B] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C9A84C] opacity-[0.07] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest mb-2">
                {t('worker.dashboard')}
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {t('worker.welcomeBack')}, {user?.name?.split(' ')[0] || 'Worker'}!
              </h1>
              <p className="text-gray-400 text-sm mt-1.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            {/* Verification badge + availability toggle */}
            <div className="flex-shrink-0 flex flex-col sm:items-end gap-3">
              {profileLoading ? (
                <div className="h-8 w-32 bg-white/10 rounded-full animate-pulse" />
              ) : !profileExists ? (
                <span className="inline-flex items-center gap-1.5 bg-gray-500/20 border border-gray-400/30 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <AlertCircle size={12} />
                  {t('worker.noProfileYet')}
                </span>
              ) : isVerified ? (
                <span className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <CheckCircle size={12} />
                  Verified Worker
                </span>
              ) : verificationStatus === 'under_review' ? (
                <span className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Clock size={12} />
                  {t('worker.underReview')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <AlertCircle size={12} />
                  {t('worker.pendingVerification')}
                </span>
              )}

              {/* Active / Inactive toggle — only for verified workers */}
              {isVerified && profileExists && (
                <button
                  onClick={handleToggleAvailability}
                  disabled={availabilityLoading}
                  className={`
                    relative inline-flex items-center gap-3 px-4 py-2 rounded-full text-xs font-semibold
                    border transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                    ${isAvailable
                      ? 'bg-green-500/20 border-green-400/40 text-green-300 hover:bg-green-500/30'
                      : 'bg-red-500/20 border-red-400/40 text-red-300 hover:bg-red-500/30'
                    }
                  `}
                >
                  {/* Toggle pill */}
                  <span className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${isAvailable ? 'bg-green-400' : 'bg-red-400/60'}`}>
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isAvailable ? 'translate-x-4' : 'translate-x-0'}`}
                    />
                  </span>
                  {availabilityLoading ? 'Updating…' : isAvailable ? 'Active' : 'Inactive'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ─── Setup prompt ───────────────────────────────────────────────── */}
        {!profileLoading && !profileExists && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 text-sm">{t('worker.completeProfileBanner')}</p>
              <p className="text-amber-700 text-xs mt-0.5">
                {t('worker.completeProfileBannerDesc')}
              </p>
            </div>
            <Link
              to="/worker/profile"
              className="flex-shrink-0 inline-flex items-center gap-1.5 bg-[#C9A84C] hover:bg-[#b8923e] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {t('worker.createProfile')}
              <ChevronRight size={14} />
            </Link>
          </div>
        )}

        {/* ─── Stats grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={Wallet}
            label={t('worker.walletBalance')}
            value={walletBalance !== null ? formatCurrency(walletBalance) : '—'}
            sub={t('worker.availableToWithdraw')}
            color="gold"
            loading={walletLoading}
          />
          <StatCard
            icon={CalendarCheck}
            label={t('worker.totalBookings')}
            value={totalBookings}
            sub={t('worker.allTime')}
            color="navy"
            loading={profileLoading}
          />
          <StatCard
            icon={Clock}
            label={t('worker.activeJobs')}
            value={bookingStats.active}
            sub={t('worker.acceptedOngoing')}
            color="amber"
            loading={recentLoading}
          />
          <StatCard
            icon={CheckCircle}
            label={t('worker.completed')}
            value={bookingStats.completed}
            sub={t('worker.successfullyFinished')}
            color="green"
            loading={recentLoading}
          />
          <StatCard
            icon={Star}
            label={t('worker.yourRating')}
            value={rating > 0 ? `${rating.toFixed(1)} ★` : '—'}
            sub={totalReviews > 0 ? `${totalReviews} ${totalReviews !== 1 ? t('worker.reviews') : t('worker.review')}` : t('worker.noReviewsYet')}
            color="green"
            loading={profileLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Pending requests */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-semibold text-[#1B2B4B]">
                  {t('worker.pendingRequests')}
                  {pendingBookings.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full">
                      {pendingBookings.length}
                    </span>
                  )}
                </h2>
                <Link
                  to="/worker/bookings"
                  className="text-[#C9A84C] hover:text-[#a8832a] text-xs font-semibold transition-colors"
                >
                  {t('worker.viewAll')}
                </Link>
              </div>

              {pendingLoading ? (
                <div className="space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : pendingBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="font-semibold text-[#1B2B4B] text-sm">{t('worker.noPendingRequests')}</p>
                  <p className="text-gray-400 text-xs mt-1 max-w-xs">
                    {t('worker.noPendingDesc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <PendingRequestCard
                      key={booking._id}
                      booking={booking}
                      onAccept={handleAccept}
                      onReject={openRejectModal}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Recent bookings */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-semibold text-[#1B2B4B]">{t('worker.recentBookings')}</h2>
                <Link
                  to="/worker/bookings"
                  className="text-[#C9A84C] hover:text-[#a8832a] text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  {t('worker.seeAll')} <ChevronRight size={12} />
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {recentLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse py-2">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-3.5 bg-gray-200 rounded w-1/3 mb-1.5" />
                          <div className="h-3 bg-gray-100 rounded w-1/4" />
                        </div>
                        <div className="h-5 w-16 bg-gray-100 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : recentBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarCheck size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-gray-400 text-sm">{t('worker.noBookingsYet')}</p>
                  </div>
                ) : (
                  <div>
                    {recentBookings.map((booking) => (
                      <RecentBookingRow key={booking._id} booking={booking} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ─── Right column ────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Profile completeness card */}
            {profileExists && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-serif text-base font-semibold text-[#1B2B4B] mb-4">{t('worker.profileCompleteness')}</h3>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">{completedItems} of {completenessItems.length} complete</span>
                    <span className="text-xs font-bold text-[#1B2B4B]">{completenessPercent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#C9A84C] to-[#e2b96a] rounded-full transition-all duration-500"
                      style={{ width: `${completenessPercent}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2.5 mb-4">
                  {completenessItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {item.done ? (
                          <CheckCircle size={10} className="text-green-600" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <span className={`text-xs ${item.done ? 'text-gray-600 line-through' : 'text-gray-500'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/worker/profile"
                  className="w-full flex items-center justify-center gap-1.5 border border-[#1B2B4B]/20 hover:border-[#1B2B4B]/40 hover:bg-[#1B2B4B]/5 text-[#1B2B4B] font-semibold py-2 rounded-lg text-xs transition-colors"
                >
                  <User size={13} />
                  {t('worker.editProfile')}
                </Link>
              </section>
            )}

            {/* Quick links */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-serif text-base font-semibold text-[#1B2B4B] mb-4">Quick Links</h3>
              <div className="space-y-1">
                {[
                  { to: '/worker/bookings', icon: CalendarCheck, label: 'My Bookings' },
                  { to: '/worker/wallet', icon: Wallet, label: 'My Wallet' },
                  { to: '/worker/profile', icon: User, label: 'Edit Profile' },
                ].map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#FAF8F3] text-gray-600 hover:text-[#1B2B4B] text-sm font-medium transition-colors group"
                  >
                    <Icon size={15} className="text-[#C9A84C] flex-shrink-0" />
                    {label}
                    <ChevronRight size={13} className="ml-auto text-gray-300 group-hover:text-[#C9A84C] transition-colors" />
                  </Link>
                ))}
              </div>
            </section>

            {/* Profile quick info (if exists) */}
            {profileExists && (
              <section className="bg-[#1B2B4B] rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  {workerProfile?.profilePhoto?.url ? (
                    <img
                      src={workerProfile.profilePhoto.url}
                      alt={user?.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#C9A84C]/40"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#C9A84C]/20 border-2 border-[#C9A84C]/30 flex items-center justify-center">
                      <span className="font-serif font-bold text-[#C9A84C] text-lg">
                        {user?.name?.[0]?.toUpperCase() || 'W'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{user?.name || 'Worker'}</p>
                    <p className="text-gray-400 text-xs">{user?.email}</p>
                  </div>
                </div>

                {(workerProfile?.services || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(workerProfile.services || []).slice(0, 3).map((svc) => (
                      <span
                        key={svc}
                        className="inline-flex items-center gap-1 text-xs bg-white/10 border border-white/10 text-gray-300 px-2 py-0.5 rounded-full"
                      >
                        {serviceIcons[svc]} {serviceLabels[svc] || svc}
                      </span>
                    ))}
                    {(workerProfile.services || []).length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{(workerProfile.services || []).length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {rating > 0 && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                    <StarRating rating={rating} size={12} />
                    <span className="text-xs text-gray-300">{rating.toFixed(1)} ({totalReviews})</span>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      {/* ─── Reject modal ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={rejectModal}
        onClose={() => {
          if (!rejectLoading) {
            setRejectModal(false);
            setRejectTarget(null);
            setRejectReason('');
          }
        }}
        title="Reject Booking Request"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 mb-0.5">Reject this booking?</p>
              <p className="text-xs text-red-600">
                You are about to reject a booking from{' '}
                <strong>{rejectTarget?.user_id?.name || 'the customer'}</strong>.
                Please provide a reason.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1B2B4B] mb-1.5">
              Reason for rejection <span className="text-red-500">*</span>
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
              onClick={() => {
                setRejectModal(false);
                setRejectTarget(null);
                setRejectReason('');
              }}
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
              {rejectLoading ? (
                <>
                  <Spinner size="sm" color="white" />
                  Rejecting…
                </>
              ) : (
                'Reject Booking'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
