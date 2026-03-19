import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Clock, Star, CheckCircle, Calendar, Phone } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/common/StarRating';
import Spinner from '../../components/common/Spinner';
import {
  serviceIcons,
  serviceLabels,
  formatCurrency,
  formatDate,
} from '../../utils/helpers';

const DURATION_TYPES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
];

const INITIAL_FORM = {
  service_type: '',
  duration_type: 'hourly',
  start_time: '',
  end_time: '',
  address: {
    street: '',
    city: '',
    state: '',
    pincode: '',
  },
  special_instructions: '',
};

function computePrice(pricing = {}, durationType, startTime, endTime) {
  if (!pricing[durationType] || !startTime || !endTime) return null;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  if (diffMs <= 0) return null;
  const rate = pricing[durationType];

  if (durationType === 'hourly') {
    const hours = diffMs / (1000 * 60 * 60);
    return rate * hours;
  }
  if (durationType === 'daily') {
    const days = diffMs / (1000 * 60 * 60 * 24);
    return rate * Math.ceil(days);
  }
  if (durationType === 'monthly') {
    const months = diffMs / (1000 * 60 * 60 * 24 * 30);
    return rate * Math.ceil(months);
  }
  return null;
}

export default function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  const fetchWorker = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/workers/${id}`);
      const workerData = data.data?.worker || data.data || data.worker || data;
      setWorker(workerData);
      setReviews(workerData.reviews || data.data?.reviews || []);
      // Pre-fill first service
      const services = workerData.services || [];
      if (services.length > 0) {
        setForm((prev) => ({ ...prev, service_type: services[0] }));
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load worker profile.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorker();
  }, [fetchWorker]);

  function handleFormChange(e) {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validateForm() {
    const errors = {};
    if (!form.service_type) errors.service_type = 'Please select a service.';
    if (!form.duration_type) errors.duration_type = 'Please select a duration type.';
    if (!form.start_time) errors.start_time = 'Start time is required.';
    if (!form.end_time) errors.end_time = 'End time is required.';
    if (form.start_time && form.end_time && new Date(form.end_time) <= new Date(form.start_time)) {
      errors.end_time = 'End time must be after start time.';
    }
    if (!form.address.street.trim()) errors['address.street'] = 'Street address is required.';
    if (!form.address.city.trim()) errors['address.city'] = 'City is required.';
    if (!form.address.state.trim()) errors['address.state'] = 'State is required.';
    if (!form.address.pincode.trim()) errors['address.pincode'] = 'Pincode is required.';
    return errors;
  }

  async function handleBookingSubmit(e) {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to book a worker.');
      navigate('/login');
      return;
    }
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the errors before submitting.');
      return;
    }
    setBookingLoading(true);
    try {
      const payload = {
        worker_id: id,
        service_type: form.service_type,
        duration_type: form.duration_type,
        start_time: form.start_time,
        end_time: form.end_time,
        address: form.address,
        special_instructions: form.special_instructions,
      };
      const { data } = await api.post('/bookings', payload);
      const bookingId = data.data?.booking?._id || data.data?._id || data.booking?._id || data._id;
      toast.success('Booking created successfully!');
      navigate(`/bookings/${bookingId}`);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create booking. Please try again.';
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  }

  const pricePreview = worker
    ? computePrice(worker.pricing || {}, form.duration_type, form.start_time, form.end_time)
    : null;

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="navy" />
          <p className="text-gray-500 text-sm">Loading worker profile…</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="font-serif text-xl font-semibold text-[#1B2B4B] mb-2">Worker not found</h2>
          <Link to="/workers" className="text-[#C9A84C] font-semibold hover:underline text-sm">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  // Backend populates user_id with { name, profilePhoto }
  const workerName = worker.user_id?.name || 'Worker';
  const photo = worker.user_id?.profilePhoto?.url;
  const initials = workerName[0]?.toUpperCase() || '?';
  const rating = worker.rating || 0;
  const reviewCount = worker.total_reviews || reviews.length;
  const services = worker.services || [];
  const pricing = worker.pricing || {};
  const isVerified = worker.is_verified || worker.verification_status === 'verified';
  const city = worker.location?.city || '';
  const experience = worker.experience_years;
  const languages = worker.languages || [];
  const bio = worker.bio || '';
  const skills = worker.skills || [];

  const inputClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-colors bg-white ${
      formErrors[field] ? 'border-red-400' : 'border-gray-200'
    }`;

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* ─── Header banner ───────────────────────────────────────────────── */}
      <div className="bg-[#1B2B4B] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to="/workers"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
          >
            ← Back to search
          </Link>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {photo ? (
                <img
                  src={photo}
                  alt={workerName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#C9A84C]/50 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#C9A84C]/20 border-2 border-[#C9A84C]/50 flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-serif font-bold text-[#C9A84C]">{initials}</span>
                </div>
              )}
              {isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                  <CheckCircle size={20} className="text-green-500 fill-green-100" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {workerName}
                </h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <CheckCircle size={11} />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={rating} size={15} />
                <span className="text-white font-semibold text-sm">
                  {rating > 0 ? rating.toFixed(1) : '—'}
                </span>
                <span className="text-gray-400 text-sm">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
              </div>

              {city && (
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
                  <MapPin size={13} />
                  <span>{city}</span>
                </div>
              )}

              {/* Service tags */}
              <div className="flex flex-wrap gap-2">
                {services.map((svc) => (
                  <span
                    key={svc}
                    className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium"
                  >
                    <span role="img" aria-label={serviceLabels[svc]}>{serviceIcons[svc]}</span>
                    {serviceLabels[svc] || svc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Left column ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Bio */}
            {bio && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-serif text-lg font-semibold text-[#1B2B4B] mb-3">About</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
              </section>
            )}

            {/* Pricing table */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-serif text-lg font-semibold text-[#1B2B4B] mb-4">Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {DURATION_TYPES.map(({ value, label }) => (
                  <div
                    key={value}
                    className="border border-[#C9A84C]/20 rounded-xl p-4 text-center bg-[#FAF8F3]"
                  >
                    <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs font-medium mb-2">
                      <Clock size={12} />
                      {label}
                    </div>
                    <div className="font-serif text-2xl font-bold text-[#1B2B4B]">
                      {pricing[value] ? formatCurrency(pricing[value]) : <span className="text-gray-300 text-base">Not offered</span>}
                    </div>
                    {pricing[value] && (
                      <div className="text-xs text-gray-400 mt-1">per {value === 'hourly' ? 'hour' : value === 'daily' ? 'day' : 'month'}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Skills & Experience */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-serif text-lg font-semibold text-[#1B2B4B] mb-4">Skills & Experience</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {experience != null && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Experience</p>
                    <p className="text-[#1B2B4B] font-semibold text-sm">
                      {experience} year{experience !== 1 ? 's' : ''} of experience
                    </p>
                  </div>
                )}
                {languages.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Languages</p>
                    <div className="flex flex-wrap gap-1.5">
                      {languages.map((lang) => (
                        <span key={lang} className="text-xs bg-[#FAF8F3] border border-gray-200 text-[#1B2B4B] px-2.5 py-1 rounded-full font-medium">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <span key={skill} className="text-xs bg-[#1B2B4B]/5 border border-[#1B2B4B]/15 text-[#1B2B4B] px-2.5 py-1 rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Reviews */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-lg font-semibold text-[#1B2B4B]">
                  Reviews <span className="text-gray-400 font-normal text-sm">({reviewCount})</span>
                </h2>
                <div className="flex items-center gap-2">
                  <StarRating rating={rating} size={15} />
                  <span className="font-semibold text-[#1B2B4B] text-sm">{rating > 0 ? rating.toFixed(1) : '—'}</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star size={32} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-gray-400 text-sm">No reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews.map((review, idx) => (
                    <div key={review._id || idx} className="flex gap-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex-shrink-0">
                        {review.customer?.profilePhoto?.url ? (
                          <img
                            src={review.customer.profilePhoto.url}
                            alt={review.customer.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#1B2B4B] flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {review.customer?.name?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-semibold text-[#1B2B4B] text-sm">
                            {review.customer?.name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {review.createdAt ? formatDate(review.createdAt) : ''}
                          </span>
                        </div>
                        <div className="mt-1 mb-2">
                          <StarRating rating={review.rating} size={13} />
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ─── Booking form (right / sticky) ─────────────────────────────── */}
          <div className="lg:w-[380px] xl:w-[420px] flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md lg:sticky lg:top-20 p-6">
              <h2 className="font-serif text-lg font-semibold text-[#1B2B4B] mb-5">Book {workerName.split(' ')[0]}</h2>

              <form onSubmit={handleBookingSubmit} noValidate className="space-y-4">
                {/* Service type */}
                <div>
                  <label className="block text-xs font-semibold text-[#1B2B4B] uppercase tracking-wider mb-1.5">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="service_type"
                    value={form.service_type}
                    onChange={handleFormChange}
                    className={inputClass('service_type')}
                  >
                    <option value="">Select a service</option>
                    {services.map((svc) => (
                      <option key={svc} value={svc}>
                        {serviceIcons[svc]} {serviceLabels[svc] || svc}
                      </option>
                    ))}
                  </select>
                  {formErrors.service_type && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.service_type}</p>
                  )}
                </div>

                {/* Duration type */}
                <div>
                  <label className="block text-xs font-semibold text-[#1B2B4B] uppercase tracking-wider mb-1.5">
                    Duration Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="duration_type"
                    value={form.duration_type}
                    onChange={handleFormChange}
                    className={inputClass('duration_type')}
                  >
                    {DURATION_TYPES.map(({ value, label }) => (
                      <option key={value} value={value} disabled={!pricing[value]}>
                        {label} {pricing[value] ? `— ${formatCurrency(pricing[value])}` : '(Not available)'}
                      </option>
                    ))}
                  </select>
                  {formErrors.duration_type && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.duration_type}</p>
                  )}
                </div>

                {/* Start / End time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1B2B4B] uppercase tracking-wider mb-1.5">
                      <Calendar size={10} className="inline mr-1" />
                      Start <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="start_time"
                      value={form.start_time}
                      onChange={handleFormChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className={inputClass('start_time')}
                    />
                    {formErrors.start_time && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.start_time}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1B2B4B] uppercase tracking-wider mb-1.5">
                      <Calendar size={10} className="inline mr-1" />
                      End <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="end_time"
                      value={form.end_time}
                      onChange={handleFormChange}
                      min={form.start_time || new Date().toISOString().slice(0, 16)}
                      className={inputClass('end_time')}
                    />
                    {formErrors.end_time && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.end_time}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#1B2B4B] uppercase tracking-wider mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="address.street"
                      value={form.address.street}
                      onChange={handleFormChange}
                      placeholder="Street address"
                      className={inputClass('address.street')}
                    />
                    {formErrors['address.street'] && (
                      <p className="text-red-500 text-xs">{formErrors['address.street']}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          name="address.city"
                          value={form.address.city}
                          onChange={handleFormChange}
                          placeholder="City"
                          className={inputClass('address.city')}
                        />
                        {formErrors['address.city'] && (
                          <p className="text-red-500 text-xs mt-1">{formErrors['address.city']}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="address.state"
                          value={form.address.state}
                          onChange={handleFormChange}
                          placeholder="State"
                          className={inputClass('address.state')}
                        />
                        {formErrors['address.state'] && (
                          <p className="text-red-500 text-xs mt-1">{formErrors['address.state']}</p>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      name="address.pincode"
                      value={form.address.pincode}
                      onChange={handleFormChange}
                      placeholder="Pincode"
                      maxLength={6}
                      className={inputClass('address.pincode')}
                    />
                    {formErrors['address.pincode'] && (
                      <p className="text-red-500 text-xs mt-1">{formErrors['address.pincode']}</p>
                    )}
                  </div>
                </div>

                {/* Special instructions */}
                <div>
                  <label className="block text-xs font-semibold text-[#1B2B4B] uppercase tracking-wider mb-1.5">
                    Special Instructions
                  </label>
                  <textarea
                    name="special_instructions"
                    value={form.special_instructions}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Any specific instructions or requirements…"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-colors bg-white resize-none"
                  />
                </div>

                {/* Price preview */}
                {pricePreview !== null && (
                  <div className="bg-[#FAF8F3] border border-[#C9A84C]/25 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Estimated Total</span>
                      <span className="font-serif text-xl font-bold text-[#1B2B4B]">
                        {formatCurrency(pricePreview)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Based on {form.duration_type} rate of {pricing[form.duration_type] ? formatCurrency(pricing[form.duration_type]) : '—'}
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#b8923e] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg shadow-md shadow-[#C9A84C]/20 transition-all duration-150 hover:-translate-y-0.5 text-sm"
                >
                  {bookingLoading ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Creating Booking…
                    </>
                  ) : (
                    'Book Now'
                  )}
                </button>

                {!user && (
                  <p className="text-center text-xs text-gray-400">
                    <Link to="/login" className="text-[#C9A84C] font-semibold hover:underline">
                      Sign in
                    </Link>{' '}
                    to book this worker
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
