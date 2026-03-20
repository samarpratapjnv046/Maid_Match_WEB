import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, ChevronRight, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import StarRating from '../../components/common/StarRating';
import {
  serviceIcons,
  serviceLabels,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from '../../utils/helpers';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'offer_pending', label: 'Pending' },
  { key: 'accepted', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const EMPTY_STATES = {
  all: { icon: '📋', title: 'No bookings yet', description: 'Your bookings will appear here once you hire a worker.' },
  offer_pending: { icon: '⏳', title: 'No pending bookings', description: 'Bookings awaiting worker acceptance will appear here.' },
  accepted: { icon: '✅', title: 'No active bookings', description: 'Currently accepted bookings will show here.' },
  completed: { icon: '🏆', title: 'No completed bookings', description: 'Finished jobs will appear here once complete.' },
  cancelled: { icon: '🚫', title: 'No cancelled bookings', description: 'Cancelled bookings will be listed here.' },
};

function SkeletonBookingCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
          <div className="h-5 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="h-8 w-8 bg-gray-100 rounded-lg" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="h-8 bg-gray-100 rounded" />
        <div className="h-8 bg-gray-100 rounded" />
        <div className="h-8 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

function BookingCard({ booking, onDelete }) {
  const workerProfile = booking.worker_id || {};
  const workerUser = workerProfile.user_id || {};
  const worker = {
    name: workerUser.name || workerProfile.name,
    profilePhoto: workerUser.profilePhoto || workerProfile.profilePhoto,
  };
  const workerPhoto = worker.profilePhoto?.url;
  const workerInitials = worker.name?.[0]?.toUpperCase() || '?';
  const service = booking.service_type;
  const status = booking.status;
  const startTime = booking.start_time;
  const amount = booking.price?.base_amount;
  const durationType = booking.duration_type;
  const city = booking.address?.city;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#C9A84C]/30 transition-all duration-200 hover:-translate-y-0.5 p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <Link to={`/bookings/${booking._id}`} className="flex-shrink-0">
          {workerPhoto ? (
            <img
              src={workerPhoto}
              alt={worker.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#1B2B4B] flex items-center justify-center">
              <span className="text-white font-bold text-base">{workerInitials}</span>
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/bookings/${booking._id}`} className="flex-1 min-w-0">
              <p className="font-semibold text-[#1B2B4B] text-sm truncate">{worker.name || 'Worker'}</p>
              {service && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <span role="img" aria-label={serviceLabels[service]}>{serviceIcons[service]}</span>
                  {serviceLabels[service] || service}
                </p>
              )}
            </Link>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={(e) => { e.preventDefault(); onDelete(booking._id); }}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete booking"
              >
                <Trash2 size={14} />
              </button>
              <Link to={`/bookings/${booking._id}`}>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#C9A84C] transition-colors mt-0.5" />
              </Link>
            </div>
          </div>
          <div className="mt-2">
            <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </span>
          </div>
        </div>
      </div>

      {/* Details row */}
      <Link to={`/bookings/${booking._id}`} className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
        {startTime && (
          <span className="flex items-center gap-1">
            <Calendar size={11} className="text-[#C9A84C]" />
            {formatDate(startTime)}
          </span>
        )}
        {durationType && (
          <span className="flex items-center gap-1 capitalize">
            <Clock size={11} className="text-[#C9A84C]" />
            {durationType}
          </span>
        )}
        {city && (
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-[#C9A84C]" />
            {city}
          </span>
        )}
        {amount != null && (
          <span className="ml-auto font-semibold text-[#1B2B4B] text-sm">
            {formatCurrency(amount)}
          </span>
        )}
      </Link>
    </div>
  );
}

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBookings = useCallback(async (status) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') {
        const statusMap = {
          offer_pending: 'offer_pending',
          accepted: 'accepted',
          completed: 'completed',
          cancelled: 'cancelled',
        };
        if (statusMap[status]) params.set('status', statusMap[status]);
      }
      const { data } = await api.get(`/bookings?${params.toString()}`);
      const list = data.data || [];
      setBookings(Array.isArray(list) ? list : []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load bookings.';
      toast.error(msg);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab, fetchBookings]);

  async function handleDelete(bookingId) {
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

  const empty = EMPTY_STATES[activeTab] || EMPTY_STATES.all;

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Page header */}
      <div className="bg-[#1B2B4B] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest mb-2">
            My Account
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">My Bookings</h1>
          <p className="mt-2 text-gray-400 text-sm">Track and manage all your service bookings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <SkeletonBookingCard />
            <SkeletonBookingCard />
            <SkeletonBookingCard />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="text-5xl mb-4">{empty.icon}</div>
              <h3 className="font-serif text-xl font-semibold text-[#1B2B4B] mb-2">{empty.title}</h3>
              <p className="text-gray-500 text-sm max-w-xs mb-6">{empty.description}</p>
              <Link
                to="/workers"
                className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8923e] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
              >
                Find Workers
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
