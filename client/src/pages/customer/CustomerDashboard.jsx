import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, Search, Star, Package, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
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

const SERVICE_SHORTCUTS = [
  { key: 'house_cleaning', label: 'House Cleaning' },
  { key: 'cooking', label: 'Cooking' },
  { key: 'babysitting', label: 'Babysitting' },
  { key: 'elder_care', label: 'Elder Care' },
  { key: 'laundry', label: 'Laundry' },
  { key: 'driver', label: 'Driver' },
];

function StatCard({ icon: Icon, label, value, color = 'blue', loading }) {
  const colorMap = {
    blue: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{label}</p>
          {loading ? (
            <div className="h-7 w-16 bg-gray-100 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function BookingRow({ booking }) {
  const worker = booking.worker_id || booking.worker || {};
  const workerName = worker.user_id?.name || worker.name || 'Worker';
  const workerPhoto = worker.user_id?.profilePhoto?.url || worker.profilePhoto?.url;
  const service = booking.service_type;
  const status = booking.status;
  const amount = booking.price?.base_amount ?? booking.totalAmount ?? booking.total_amount;

  return (
    <Link
      to={`/bookings/${booking._id}`}
      className="flex items-center gap-3 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 rounded-lg px-2 -mx-2 transition-colors group"
    >
      <div className="flex-shrink-0">
        {workerPhoto ? (
          <img src={workerPhoto} alt={workerName} className="w-9 h-9 rounded-full object-cover border border-gray-100" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-bold text-xs">{workerName[0]?.toUpperCase() || '?'}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{workerName}</p>
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
          <p className="text-xs font-semibold text-gray-700 mt-1">{formatCurrency(amount)}</p>
        )}
      </div>
      <ChevronRight size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
    </Link>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch total, active, and completed counts alongside the 5 recent bookings
      const [allRes, activeRes, completedRes, recentRes] = await Promise.all([
        api.get('/bookings?limit=1'),
        api.get('/bookings?status=offer_pending,accepted,pending_payment,paid&limit=1'),
        api.get('/bookings?status=completed&limit=1'),
        api.get('/bookings?limit=5'),
      ]);
      setStats({
        total: allRes.data?.total ?? 0,
        active: activeRes.data?.total ?? 0,
        completed: completedRes.data?.total ?? 0,
      });
      const list = recentRes.data?.data || recentRes.data?.bookings || [];
      setBookings(Array.isArray(list) ? list : []);
    } catch {
      setBookings([]);
      setStats({ total: 0, active: 0, completed: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalBookings = stats.total;
  const activeBookings = stats.active;
  const completedBookings = stats.completed;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-primary-200 text-xs font-semibold uppercase tracking-widest mb-2">
                Customer Dashboard
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Hello, {user?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-primary-200 text-sm mt-1.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <Link
              to="/workers"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md hover:bg-primary-50 transition-colors flex-shrink-0"
            >
              <Search size={16} />
              Find a Worker
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={Package} label="Total Bookings" value={totalBookings} color="blue" loading={loading} />
          <StatCard icon={Clock} label="Active" value={activeBookings} color="amber" loading={loading} />
          <StatCard icon={CheckCircle} label="Completed" value={completedBookings} color="green" loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent bookings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <Link to="/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Spinner size="md" color="navy" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar size={36} className="text-gray-200 mb-3" />
                  <p className="font-semibold text-gray-700 text-sm">No bookings yet</p>
                  <p className="text-gray-400 text-xs mt-1 max-w-xs">
                    Find and book a worker to get started.
                  </p>
                  <Link
                    to="/workers"
                    className="mt-4 inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <Search size={14} />
                    Find Workers
                  </Link>
                </div>
              ) : (
                <div>
                  {bookings.map((booking) => (
                    <BookingRow key={booking._id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Quick service search */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Find by Service</h3>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_SHORTCUTS.map(({ key, label }) => (
                  <Link
                    key={key}
                    to={`/workers?service=${key}`}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-primary-300 hover:bg-primary-50 transition-all duration-150 text-center group"
                  >
                    <span className="text-2xl leading-none">{serviceIcons[key]}</span>
                    <span className="text-xs font-medium text-gray-600 group-hover:text-primary-700">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tips card */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Star size={16} className="text-yellow-300 fill-yellow-300" />
                <h3 className="text-sm font-semibold">Pro Tips</h3>
              </div>
              <ul className="space-y-2 text-xs text-primary-100">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300 flex-shrink-0">•</span>
                  Check worker ratings and reviews before booking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300 flex-shrink-0">•</span>
                  Share the OTP with the worker only after they arrive
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300 flex-shrink-0">•</span>
                  Leave a review to help other customers
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
