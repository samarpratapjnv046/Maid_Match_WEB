import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Filter, Search, MapPin, Star, ChevronDown, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/common/StarRating';
import Spinner from '../../components/common/Spinner';
import {
  serviceIcons,
  serviceLabels,
  formatCurrency,
  getStatusColor,
} from '../../utils/helpers';

const SERVICE_KEYS = Object.keys(serviceLabels);

const DURATION_TYPES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="h-10 bg-gray-100 rounded-lg" />
        <div className="h-10 bg-gray-100 rounded-lg" />
        <div className="h-10 bg-gray-100 rounded-lg" />
      </div>
      <div className="mt-4 h-9 bg-gray-200 rounded-lg" />
    </div>
  );
}

function WorkerCard({ worker }) {
  // Backend populates user_id with { name, profilePhoto }
  const photo = worker.user_id?.profilePhoto?.url;
  const name = worker.user_id?.name || 'Worker';
  const initials = name[0]?.toUpperCase() || '?';
  const rating = worker.rating || 0;
  const reviewCount = worker.total_reviews || 0;
  const services = worker.services || [];
  const pricing = worker.pricing || {};
  const experience = worker.experience_years;
  const city = worker.location?.city || '';
  const pincode = worker.location?.pincode || '';
  const isVerified = worker.is_verified || worker.verification_status === 'verified';

  return (
    <div className="bg-[#FDFCF8] rounded-2xl border-l-4 border-l-[#C9A84C] border border-[#E8E2D5] shadow-[0_4px_20px_rgba(201,168,76,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(201,168,76,0.18),0_2px_8px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#C9A84C]/40 ring-offset-2 ring-offset-[#FDFCF8]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#1B2B4B] flex items-center justify-center ring-2 ring-[#C9A84C]/40 ring-offset-2 ring-offset-[#FDFCF8]">
              <span className="text-white font-bold text-xl font-serif">{initials}</span>
            </div>
          )}
          {isVerified && (
            <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
              <CheckCircle size={14} className="text-green-500 fill-green-100" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-semibold text-[#1B2B4B] text-base leading-tight truncate">
              {name}
            </h3>
            {isVerified && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor('verified')}`}>
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <StarRating rating={rating} size={13} />
            <span className="text-sm font-semibold text-[#1B2B4B]">{rating > 0 ? rating.toFixed(1) : '—'}</span>
            <span className="text-xs text-gray-400">({reviewCount} reviews)</span>
          </div>

          <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
            <MapPin size={11} />
            <span>{[city, pincode].filter(Boolean).join(' – ') || '—'}</span>
          </div>
        </div>
      </div>

      {/* Service badges */}
      <div className="mt-4 flex flex-wrap gap-1.5 min-h-[2rem]">
        {services.slice(0, 4).map((svc) => (
          <span
            key={svc}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-[#C9A84C]/30 text-[#1B2B4B] rounded-full font-medium shadow-sm"
          >
            <span role="img" aria-label={serviceLabels[svc]}>{serviceIcons[svc]}</span>
            {serviceLabels[svc] || svc}
          </span>
        ))}
        {services.length > 4 && (
          <span className="text-xs px-2.5 py-1 bg-white border border-gray-200 text-gray-500 rounded-full font-medium shadow-sm">
            +{services.length - 4} more
          </span>
        )}
      </div>

      {/* Spacer pushes pricing + footer to bottom */}
      <div className="flex-1" />

      {/* Pricing row */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Hourly', key: 'hourly' },
          { label: 'Daily', key: 'daily' },
          { label: 'Monthly', key: 'monthly' },
        ].map(({ label, key }) => (
          <div key={key} className="bg-white border border-[#E8E2D5] rounded-lg py-2 px-1 shadow-sm">
            <div className="text-xs text-gray-400 font-medium mb-0.5">{label}</div>
            <div className="text-sm font-semibold text-[#1B2B4B]">
              {pricing[key] ? formatCurrency(pricing[key]) : <span className="text-gray-300 text-xs">N/A</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Footer row */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#E8E2D5]">
        <span className="text-xs text-gray-500">
          {experience != null && experience > 0
            ? <><span className="font-semibold text-[#1B2B4B]">{experience}</span> yr{experience !== 1 ? 's' : ''} exp</>
            : <span className="text-gray-300">—</span>
          }
        </span>
        <Link
          to={`/workers/${worker._id}`}
          className="inline-flex items-center gap-1.5 bg-[#1B2B4B] hover:bg-[#152238] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-150 hover:-translate-y-0.5 shadow-sm"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

export default function SearchWorkers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const initialService = searchParams.get('service') || '';

  const [filters, setFilters] = useState({
    services: initialService ? [initialService] : [],
    city: '',
    pincode: '',
    durationType: '',
    minRating: 0,
    maxRating: 5,
  });
  const [ratingRange, setRatingRange] = useState([0, 5]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const buildParams = useCallback(
    (pageNum = 1) => {
      const params = new URLSearchParams();
      if (filters.services.length > 0) params.set('services', filters.services.join(','));
      if (filters.city.trim()) params.set('city', filters.city.trim());
      if (filters.pincode.trim()) params.set('pincode', filters.pincode.trim());
      if (filters.durationType) params.set('durationType', filters.durationType);
      if (ratingRange[0] > 0) params.set('minRating', ratingRange[0]);
      if (ratingRange[1] < 5) params.set('maxRating', ratingRange[1]);
      params.set('page', pageNum);
      params.set('limit', 9);
      return params;
    },
    [filters, ratingRange]
  );

  const fetchWorkers = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);
        const params = buildParams(pageNum);
        const { data } = await api.get(`/workers/search?${params.toString()}`);
        let list = data.data?.workers || data.workers || data.data || [];
        // Exclude logged-in worker from their own search results
        if (user?.role === 'worker') {
          list = list.filter((w) => w.user_id?._id !== user._id && w.user_id !== user._id);
        }
        const total = data.data?.total ?? data.total ?? list.length;
        const limitUsed = 9;
        setTotalCount(total);
        setHasMore(pageNum * limitUsed < total);
        if (append) {
          setWorkers((prev) => [...prev, ...list]);
        } else {
          setWorkers(list);
        }
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to load workers.';
        toast.error(msg);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildParams]
  );

  // Initial load + filter changes
  useEffect(() => {
    setPage(1);
    fetchWorkers(1, false);
    // Update URL query param for service
    if (filters.services.length === 1) {
      setSearchParams({ service: filters.services[0] }, { replace: true });
    } else if (filters.services.length === 0) {
      setSearchParams({}, { replace: true });
    }
  }, [filters, ratingRange]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleServiceToggle(key) {
    setFilters((prev) => ({
      ...prev,
      services: prev.services.includes(key)
        ? prev.services.filter((s) => s !== key)
        : [...prev.services, key],
    }));
  }

  function handleDurationToggle(val) {
    setFilters((prev) => ({
      ...prev,
      durationType: prev.durationType === val ? '' : val,
    }));
  }

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchWorkers(nextPage, true);
  }

  function handleReset() {
    setFilters({ services: [], city: '', pincode: '', durationType: '', minRating: 0, maxRating: 5 });
    setRatingRange([0, 5]);
  }

  const activeFilterCount =
    filters.services.length +
    (filters.city.trim() ? 1 : 0) +
    (filters.pincode.trim() ? 1 : 0) +
    (filters.durationType ? 1 : 0) +
    (ratingRange[0] > 0 || ratingRange[1] < 5 ? 1 : 0);

  // Sidebar content (shared between mobile drawer and desktop)
  const SidebarContent = (
    <div className="flex flex-col gap-6">
      {/* Service Types */}
      <div>
        <h3 className="font-serif text-sm font-semibold text-[#1B2B4B] uppercase tracking-wider mb-3">
          Service Type
        </h3>
        <div className="space-y-2">
          {SERVICE_KEYS.map((key) => (
            <label
              key={key}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.services.includes(key)}
                onChange={() => handleServiceToggle(key)}
                className="w-4 h-4 rounded border-gray-300 accent-[#C9A84C] cursor-pointer"
              />
              <span className="flex items-center gap-1.5 text-sm text-gray-700 group-hover:text-[#1B2B4B] transition-colors">
                <span role="img" aria-label={serviceLabels[key]}>{serviceIcons[key]}</span>
                {serviceLabels[key]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Pincode */}
      <div>
        <h3 className="font-serif text-sm font-semibold text-[#1B2B4B] uppercase tracking-wider mb-3">
          Pincode
        </h3>
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            maxLength={6}
            value={filters.pincode}
            onChange={(e) => setFilters((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
            placeholder="e.g. 400001"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] bg-white transition-colors"
          />
        </div>
      </div>

      {/* City */}
      <div>
        <h3 className="font-serif text-sm font-semibold text-[#1B2B4B] uppercase tracking-wider mb-3">
          City
        </h3>
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filters.city}
            onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
            placeholder="e.g. Mumbai"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] bg-white transition-colors"
          />
        </div>
      </div>

      {/* Duration Type */}
      <div>
        <h3 className="font-serif text-sm font-semibold text-[#1B2B4B] uppercase tracking-wider mb-3">
          Duration Type
        </h3>
        <div className="flex flex-col gap-2">
          {DURATION_TYPES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="durationType"
                checked={filters.durationType === value}
                onChange={() => handleDurationToggle(value)}
                className="w-4 h-4 border-gray-300 accent-[#C9A84C] cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-[#1B2B4B] transition-colors">
                {label}
              </span>
            </label>
          ))}
          {filters.durationType && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, durationType: '' }))}
              className="text-xs text-[#C9A84C] hover:text-[#a8832a] mt-1 text-left font-medium transition-colors"
            >
              Clear selection
            </button>
          )}
        </div>
      </div>

      {/* Rating Range */}
      <div>
        <h3 className="font-serif text-sm font-semibold text-[#1B2B4B] uppercase tracking-wider mb-3">
          Minimum Rating
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Any</span>
            <span className="font-semibold text-[#1B2B4B]">
              {ratingRange[0] > 0 ? `${ratingRange[0]}+ stars` : 'All ratings'}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={ratingRange[0]}
            onChange={(e) => setRatingRange([parseFloat(e.target.value), ratingRange[1]])}
            className="w-full accent-[#C9A84C]"
          />
          <div className="flex items-center gap-1 mt-1">
            <StarRating rating={ratingRange[0]} size={14} />
            <span className="text-xs text-gray-500 ml-1">{ratingRange[0].toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <button
          onClick={handleReset}
          className="w-full border border-gray-200 hover:border-red-300 hover:text-red-600 text-gray-500 text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Page header */}
      <div className="bg-[#1B2B4B] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest mb-2">
            Find Professionals
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Search Workers
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            {loading ? 'Loading…' : `${totalCount} verified professional${totalCount !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* ─── Desktop Sidebar ─────────────────────────────────────────── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Filter size={15} className="text-[#C9A84C]" />
                  <span className="font-serif font-semibold text-[#1B2B4B] text-sm">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#C9A84C] text-white text-xs font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
              </div>
              {SidebarContent}
            </div>
          </aside>

          {/* ─── Main Content ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter bar */}
            <div className="flex items-center gap-3 mb-5 lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 bg-white border border-gray-200 text-[#1B2B4B] text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:border-[#C9A84C]/50 transition-colors"
              >
                <Filter size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#C9A84C] text-white text-xs font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Active filter chips */}
            {(filters.services.length > 0 || filters.city || filters.pincode || filters.durationType) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.services.map((svc) => (
                  <span
                    key={svc}
                    className="inline-flex items-center gap-1 bg-[#1B2B4B] text-white text-xs px-3 py-1 rounded-full font-medium"
                  >
                    {serviceIcons[svc]} {serviceLabels[svc]}
                    <button
                      onClick={() => handleServiceToggle(svc)}
                      className="ml-1 hover:text-[#C9A84C] transition-colors leading-none"
                      aria-label={`Remove ${serviceLabels[svc]} filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.pincode && (
                  <span className="inline-flex items-center gap-1 bg-[#1B2B4B] text-white text-xs px-3 py-1 rounded-full font-medium">
                    <MapPin size={10} /> {filters.pincode}
                    <button
                      onClick={() => setFilters((p) => ({ ...p, pincode: '' }))}
                      className="ml-1 hover:text-[#C9A84C] transition-colors leading-none"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.city && (
                  <span className="inline-flex items-center gap-1 bg-[#1B2B4B] text-white text-xs px-3 py-1 rounded-full font-medium">
                    <MapPin size={10} /> {filters.city}
                    <button
                      onClick={() => setFilters((p) => ({ ...p, city: '' }))}
                      className="ml-1 hover:text-[#C9A84C] transition-colors leading-none"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.durationType && (
                  <span className="inline-flex items-center gap-1 bg-[#1B2B4B] text-white text-xs px-3 py-1 rounded-full font-medium">
                    {DURATION_TYPES.find((d) => d.value === filters.durationType)?.label}
                    <button
                      onClick={() => setFilters((p) => ({ ...p, durationType: '' }))}
                      className="ml-1 hover:text-[#C9A84C] transition-colors leading-none"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : workers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-serif text-xl font-semibold text-[#1B2B4B] mb-2">
                  No workers found
                </h3>
                <p className="text-gray-500 text-sm max-w-xs mb-6">
                  Try adjusting your filters or search in a different city.
                </p>
                <button
                  onClick={handleReset}
                  className="bg-[#C9A84C] hover:bg-[#b8923e] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
                  {workers.map((worker) => (
                    <WorkerCard key={worker._id} worker={worker} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-[#C9A84C]/50 text-[#1B2B4B] font-semibold text-sm px-8 py-3 rounded-lg shadow-sm transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
                    >
                      {loadingMore ? (
                        <>
                          <Spinner size="sm" color="gold" />
                          Loading…
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          Load More Workers
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white shadow-2xl flex flex-col animate-slideInLeft">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-[#C9A84C]" />
                <span className="font-serif font-semibold text-[#1B2B4B]">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#C9A84C] text-white text-xs font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {SidebarContent}
            </div>
            <div className="p-5 border-t border-gray-100">
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full bg-[#1B2B4B] hover:bg-[#152238] text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
