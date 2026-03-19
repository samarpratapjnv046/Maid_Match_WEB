import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Clock, Calendar, CheckCircle, Phone, Mail, AlertTriangle, Trash2, Lock } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import StarRating from '../../components/common/StarRating';
import Spinner from '../../components/common/Spinner';
import {
  serviceIcons,
  serviceLabels,
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
  getStatusLabel,
} from '../../utils/helpers';

// ─── Razorpay loader ───────────────────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Status timeline step ─────────────────────────────────────────────────────
const STATUS_ORDER = [
  'offer_pending',
  'accepted',
  'pending_payment',
  'paid',
  'completed',
];

function StatusTimeline({ history = [], currentStatus }) {
  if (!history || history.length === 0) return null;
  return (
    <div className="space-y-3">
      {history.map((entry, idx) => {
        const isLast = idx === history.length - 1;
        return (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                  isLast
                    ? 'bg-[#1B2B4B] border-[#1B2B4B] text-white'
                    : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {isLast ? (
                  <CheckCircle size={14} className="text-[#C9A84C]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              {!isLast && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
            </div>
            <div className="pb-4 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(entry.status)}`}
                >
                  {getStatusLabel(entry.status)}
                </span>
              </div>
              {entry.timestamp && (
                <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(entry.timestamp)}</p>
              )}
              {entry.note && (
                <p className="text-xs text-gray-500 mt-1 italic">{entry.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Price breakdown row ──────────────────────────────────────────────────────
function PriceRow({ label, value, highlight }) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${
        highlight ? 'border-t border-gray-200 mt-1 pt-3' : 'border-b border-gray-50'
      }`}
    >
      <span className={`text-sm ${highlight ? 'font-semibold text-[#1B2B4B]' : 'text-gray-500'}`}>
        {label}
      </span>
      <span className={`${highlight ? 'font-serif text-lg font-bold text-[#1B2B4B]' : 'text-sm font-medium text-[#1B2B4B]'}`}>
        {value}
      </span>
    </div>
  );
}

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cancellation modal
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Review modal
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Payment
  const [payLoading, setPayLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // OTP display after payment
  const [otpModal, setOtpModal] = useState(false);
  const [completionOtp, setCompletionOtp] = useState('');

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/bookings/${id}`);
      const b = data.data?.booking || data.data || data.booking || data;
      setBooking(b);
      setReviewSubmitted(!!b.review);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load booking details.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // ─── Cancel handler ─────────────────────────────────────────────────────────
  async function handleCancel() {
    setCancelLoading(true);
    try {
      await api.patch(`/bookings/${id}/cancel`, { reason: cancelReason });
      toast.success('Booking cancelled successfully.');
      setCancelModal(false);
      setCancelReason('');
      fetchBooking();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to cancel booking.';
      toast.error(msg);
    } finally {
      setCancelLoading(false);
    }
  }

  // ─── Delete handler ─────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!window.confirm('Delete this booking? This cannot be undone.')) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking deleted.');
      navigate(user?.role === 'worker' ? '/worker/bookings' : user?.role === 'admin' ? '/admin/bookings' : '/bookings');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete booking.');
      setDeleteLoading(false);
    }
  }

  // ─── Pay Now handler (Razorpay) ─────────────────────────────────────────────
  async function handlePayNow() {
    setPayLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setPayLoading(false);
        return;
      }

      // Create Razorpay order
      const { data: orderData } = await api.post('/payments/create-order', {
        booking_id: id,
      });
      const orderId = orderData.order_id || orderData.data?.order?.id;
      const orderAmount = orderData.amount || orderData.data?.order?.amount;
      const orderCurrency = orderData.currency || orderData.data?.order?.currency || 'INR';
      const rzpKey = orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;

      const options = {
        key: rzpKey,
        amount: orderAmount,
        currency: orderCurrency,
        name: 'MaidMatch',
        description: `Booking #${id.slice(-8).toUpperCase()}`,
        order_id: orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#C9A84C',
        },
        handler: async function (response) {
          try {
            const { data: verifyData } = await api.post('/payments/verify', {
              booking_id: id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyData.otp) {
              setCompletionOtp(verifyData.otp);
              setOtpModal(true);
            } else {
              toast.success('Payment successful! Your booking is confirmed.');
            }
            fetchBooking();
          } catch (verifyErr) {
            const msg = verifyErr?.response?.data?.message || 'Payment verification failed. Contact support.';
            toast.error(msg);
          }
        },
        modal: {
          ondismiss: () => {
            setPayLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error?.description || 'Payment failed. Please try again.');
        setPayLoading(false);
      });
      rzp.open();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to initiate payment.';
      toast.error(msg);
    } finally {
      setPayLoading(false);
    }
  }

  // ─── Review handler ─────────────────────────────────────────────────────────
  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (reviewRating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    setReviewLoading(true);
    try {
      await api.post(`/bookings/${id}/review`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      toast.success('Review submitted successfully!');
      setReviewModal(false);
      setReviewSubmitted(true);
      setReviewRating(0);
      setReviewComment('');
      fetchBooking();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit review.';
      toast.error(msg);
    } finally {
      setReviewLoading(false);
    }
  }

  // ─── Loading / error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="navy" />
          <p className="text-gray-500 text-sm">Loading booking details…</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="font-serif text-xl font-semibold text-[#1B2B4B] mb-2">Booking not found</h2>
          <Link to={user?.role === 'worker' ? '/worker/bookings' : '/bookings'} className="text-[#C9A84C] font-semibold hover:underline text-sm">
            Back to my bookings
          </Link>
        </div>
      </div>
    );
  }

  // Destructure booking
  const workerProfile = booking.worker_id || {};
  const workerUser = workerProfile.user_id || {};
  const worker = {
    _id: workerProfile._id,
    name: workerUser.name || workerProfile.name,
    profilePhoto: workerUser.profilePhoto || workerProfile.profilePhoto,
    averageRating: workerProfile.averageRating,
    totalReviews: workerProfile.totalReviews,
    city: workerProfile.city,
    isVerified: workerProfile.is_verified,
  };
  const workerPhoto = worker.profilePhoto?.url;
  const workerInitials = worker.name?.[0]?.toUpperCase() || '?';
  const customer = booking.user_id || {};
  const service = booking.service_type;
  const status = booking.status;
  const statusHistory = booking.status_history || booking.statusHistory || [];
  const startTime = booking.start_time;
  const endTime = booking.end_time;
  const address = booking.address || {};
  const totalAmount = booking.price?.base_amount;
  const platformFee = booking.price?.platform_commission;
  const workerPayout = booking.price?.worker_payout;
  const durationType = booking.duration_type;
  const specialInstructions = booking.special_instructions;
  const payment = booking.payment_id || {};
  const existingReview = booking.review;

  // Determine which actions to show
  const canCancel = user?.role === 'customer' && ['offer_pending', 'accepted'].includes(status);
  const canPay = user?.role === 'customer' && ['accepted', 'pending_payment'].includes(status);
  const canReview = status === 'completed' && !reviewSubmitted && !existingReview;
  const isPaid = ['paid', 'pending_payment', 'completed'].includes(status);
  // Contact info is revealed only after worker accepts
  const contactsVisible = ['accepted', 'pending_payment', 'paid', 'completed'].includes(status);

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <div className="bg-[#1B2B4B] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Link
            to={user?.role === 'worker' ? '/worker/bookings' : '/bookings'}
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-5 transition-colors"
          >
            ← Back to bookings
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest mb-1">
                Booking Details
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                #{String(booking._id).slice(-8).toUpperCase()}
              </h1>
            </div>
            <span className={`text-sm px-4 py-2 rounded-full font-semibold ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── Left: booking info ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Customer card — shown to worker and admin */}
            {(user?.role === 'worker' || user?.role === 'admin') && (
              <section className={`bg-white rounded-2xl border shadow-sm p-5 ${contactsVisible ? 'border-green-100' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-base font-semibold text-[#1B2B4B]">Customer</h2>
                  {contactsVisible ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full font-semibold">
                      <CheckCircle size={11} /> Contact Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-medium">
                      <Lock size={11} /> Pending Acceptance
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#1B2B4B] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">{customer.name?.[0]?.toUpperCase() || '?'}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2B4B]">{customer.name || 'Customer'}</p>
                    {!contactsVisible && (
                      <p className="text-xs text-gray-400 mt-0.5">Contact details visible after you accept the booking</p>
                    )}
                  </div>
                </div>

                {contactsVisible && (
                  <div className="space-y-2.5 pt-3 border-t border-gray-100">
                    {customer.phone && (
                      <a
                        href={`tel:${customer.phone}`}
                        className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                          <Phone size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Phone</p>
                          <p className="text-sm font-semibold text-[#1B2B4B] group-hover:text-green-700">{customer.phone}</p>
                        </div>
                      </a>
                    )}
                    {customer.email && (
                      <a
                        href={`mailto:${customer.email}`}
                        className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <Mail size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Email</p>
                          <p className="text-sm font-semibold text-[#1B2B4B] group-hover:text-blue-700">{customer.email}</p>
                        </div>
                      </a>
                    )}
                    {(customer.address?.street || customer.address?.city) && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-[#1B2B4B] flex items-center justify-center flex-shrink-0">
                          <MapPin size={14} className="text-[#C9A84C]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Address</p>
                          <p className="text-sm font-semibold text-[#1B2B4B]">
                            {[customer.address?.street, customer.address?.city, customer.address?.state, customer.address?.pincode]
                              .filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Worker card — shown to customer and admin */}
            {(user?.role === 'customer' || user?.role === 'admin') && (
            <section className={`bg-white rounded-2xl border shadow-sm p-5 ${contactsVisible ? 'border-green-100' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-base font-semibold text-[#1B2B4B]">Worker</h2>
                {contactsVisible ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full font-semibold">
                    <CheckCircle size={11} /> Contact Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-medium">
                    <Lock size={11} /> Awaiting Acceptance
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4">
                {workerPhoto ? (
                  <img src={workerPhoto} alt={worker.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#1B2B4B] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">{workerInitials}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#1B2B4B]">{worker.name || 'Worker'}</p>
                    {worker.isVerified && (
                      <CheckCircle size={14} className="text-green-500 fill-green-100 flex-shrink-0" />
                    )}
                  </div>
                  {workerProfile.rating > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <StarRating rating={workerProfile.rating} size={13} />
                      <span className="text-xs text-gray-500">({workerProfile.total_reviews || 0} reviews)</span>
                    </div>
                  )}
                  {!contactsVisible && (
                    <p className="text-xs text-gray-400 mt-0.5">Contact details visible once worker accepts</p>
                  )}
                </div>
                <Link
                  to={`/workers/${worker._id}`}
                  className="text-[#C9A84C] hover:text-[#a8832a] text-xs font-semibold transition-colors flex-shrink-0"
                >
                  View Profile
                </Link>
              </div>

              {contactsVisible && (
                <div className="space-y-2.5 pt-3 border-t border-gray-100">
                  {workerUser.phone && (
                    <a
                      href={`tel:${workerUser.phone}`}
                      className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                        <Phone size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                        <p className="text-sm font-semibold text-[#1B2B4B] group-hover:text-green-700">{workerUser.phone}</p>
                      </div>
                    </a>
                  )}
                  {workerUser.email && (
                    <a
                      href={`mailto:${workerUser.email}`}
                      className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Mail size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-sm font-semibold text-[#1B2B4B] group-hover:text-blue-700">{workerUser.email}</p>
                      </div>
                    </a>
                  )}
                  {workerProfile.location?.city && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-[#1B2B4B] flex items-center justify-center flex-shrink-0">
                        <MapPin size={14} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Location</p>
                        <p className="text-sm font-semibold text-[#1B2B4B]">
                          {[workerProfile.location.city, workerProfile.location.state, workerProfile.location.pincode]
                            .filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
            )}

            {/* Service & Schedule */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-serif text-base font-semibold text-[#1B2B4B] mb-4">Service & Schedule</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {service && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Service</p>
                    <p className="flex items-center gap-1.5 text-[#1B2B4B] font-medium">
                      <span role="img" aria-label={serviceLabels[service]}>{serviceIcons[service]}</span>
                      {serviceLabels[service] || service}
                    </p>
                  </div>
                )}
                {durationType && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Duration Type</p>
                    <p className="flex items-center gap-1.5 text-[#1B2B4B] font-medium capitalize">
                      <Clock size={13} className="text-[#C9A84C]" />
                      {durationType}
                    </p>
                  </div>
                )}
                {startTime && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Start Time</p>
                    <p className="flex items-center gap-1.5 text-[#1B2B4B] font-medium">
                      <Calendar size={13} className="text-[#C9A84C]" />
                      {formatDateTime(startTime)}
                    </p>
                  </div>
                )}
                {endTime && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">End Time</p>
                    <p className="flex items-center gap-1.5 text-[#1B2B4B] font-medium">
                      <Calendar size={13} className="text-[#C9A84C]" />
                      {formatDateTime(endTime)}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Address */}
            {(address.street || address.city) && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-serif text-base font-semibold text-[#1B2B4B] mb-3">Service Address</h2>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                  <p>
                    {[address.street, address.city, address.state, address.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </section>
            )}

            {/* Special instructions */}
            {specialInstructions && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-serif text-base font-semibold text-[#1B2B4B] mb-2">Special Instructions</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{specialInstructions}</p>
              </section>
            )}

            {/* Review (submitted) */}
            {(reviewSubmitted || existingReview) && (
              <section className="bg-white rounded-2xl border border-green-100 shadow-sm p-5">
                <h2 className="font-serif text-base font-semibold text-[#1B2B4B] mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Your Review
                </h2>
                <div className="mb-2">
                  <StarRating rating={existingReview?.rating || reviewRating} size={16} />
                </div>
                {existingReview?.comment && (
                  <p className="text-gray-600 text-sm italic">"{existingReview.comment}"</p>
                )}
              </section>
            )}

            {/* Status timeline */}
            {statusHistory.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-serif text-base font-semibold text-[#1B2B4B] mb-4">Status History</h2>
                <StatusTimeline history={statusHistory} currentStatus={status} />
              </section>
            )}
          </div>

          {/* ─── Right: price + actions ─────────────────────────────────────── */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0 space-y-5">
            {/* Price breakdown */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-serif text-base font-semibold text-[#1B2B4B] mb-3">Price Breakdown</h2>
              <div>
                {workerPayout != null && (
                  <PriceRow label="Worker Earnings" value={formatCurrency(workerPayout)} />
                )}
                {platformFee != null && (
                  <PriceRow label="Platform Commission" value={formatCurrency(platformFee)} />
                )}
                {totalAmount != null && (
                  <PriceRow label="Total" value={formatCurrency(totalAmount)} highlight />
                )}
              </div>

              {/* Payment status */}
              {isPaid && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                  <CheckCircle size={13} />
                  Payment received
                </div>
              )}
            </section>

            {/* Action buttons */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h2 className="font-serif text-base font-semibold text-[#1B2B4B] mb-3">Actions</h2>

              {/* Pay Now */}
              {canPay && (
                <button
                  onClick={handlePayNow}
                  disabled={payLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#b8923e] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg text-sm shadow-md shadow-[#C9A84C]/20 transition-all duration-150 hover:-translate-y-0.5"
                >
                  {payLoading ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Processing…
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              )}

              {/* Leave Review */}
              {canReview && (
                <button
                  onClick={() => setReviewModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#1B2B4B] hover:bg-[#152238] text-white font-semibold py-3 rounded-lg text-sm transition-all duration-150 hover:-translate-y-0.5"
                >
                  Leave a Review
                </button>
              )}

              {/* Cancel */}
              {canCancel && (
                <button
                  onClick={() => setCancelModal(true)}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 font-semibold py-3 rounded-lg text-sm transition-all duration-150"
                >
                  Cancel Booking
                </button>
              )}

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="w-full flex items-center justify-center gap-2 border border-red-200 hover:border-red-400 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed text-red-600 font-semibold py-3 rounded-lg text-sm transition-all duration-150"
              >
                {deleteLoading ? <Spinner size="sm" color="red" /> : <Trash2 size={14} />}
                Delete Booking
              </button>
            </section>

            {/* Support note */}
            <p className="text-xs text-gray-400 text-center leading-relaxed px-2">
              Need help?{' '}
              <a href="mailto:support@maidease.in" className="text-[#C9A84C] hover:underline font-medium">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ─── Cancel Confirmation Modal ──────────────────────────────────────── */}
      <Modal
        isOpen={cancelModal}
        onClose={() => { if (!cancelLoading) { setCancelModal(false); setCancelReason(''); } }}
        title="Cancel Booking"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-relaxed">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1B2B4B] mb-1.5">
              Reason for cancellation (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Let us know why you're cancelling…"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setCancelModal(false); setCancelReason(''); }}
              disabled={cancelLoading}
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {cancelLoading ? (
                <>
                  <Spinner size="sm" color="white" />
                  Cancelling…
                </>
              ) : (
                'Yes, Cancel'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── OTP Display Modal (shown to customer after payment) ────────── */}
      <Modal
        isOpen={otpModal}
        onClose={() => setOtpModal(false)}
        title="Your Booking OTP"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <CheckCircle size={28} className="text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">Payment successful! Share this OTP with your worker when they arrive to verify job completion.</p>
          </div>
          <div className="bg-[#FAF8F3] border-2 border-dashed border-[#C9A84C]/50 rounded-xl p-6 text-center">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest font-semibold">Your OTP</p>
            <p className="text-4xl font-extrabold tracking-[0.3em] text-[#1B2B4B]">{completionOtp}</p>
          </div>
          <p className="text-xs text-gray-400 text-center">Keep this OTP safe. The worker will enter it once the job is complete to unlock their payment.</p>
          <button
            onClick={() => setOtpModal(false)}
            className="w-full bg-[#1B2B4B] hover:bg-[#152238] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            I've noted the OTP
          </button>
        </div>
      </Modal>

      {/* ─── Review Modal ───────────────────────────────────────────────────── */}
      <Modal
        isOpen={reviewModal}
        onClose={() => { if (!reviewLoading) setReviewModal(false); }}
        title="Leave a Review"
        size="sm"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-5">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              How was your experience with{' '}
              <span className="font-semibold text-[#1B2B4B]">{worker.name?.split(' ')[0] || 'the worker'}</span>?
            </p>
            <div className="flex flex-col items-center gap-3 py-4 bg-[#FAF8F3] rounded-xl">
              <StarRating
                rating={reviewRating}
                size={32}
                onChange={(val) => setReviewRating(val)}
              />
              <p className="text-xs text-gray-400">
                {reviewRating === 0
                  ? 'Tap a star to rate'
                  : reviewRating === 5
                  ? 'Excellent!'
                  : reviewRating >= 4
                  ? 'Very Good!'
                  : reviewRating >= 3
                  ? 'Good'
                  : reviewRating >= 2
                  ? 'Fair'
                  : 'Poor'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1B2B4B] mb-1.5">
              Comment (optional)
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Share your experience with this worker…"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{reviewComment.length}/500</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setReviewModal(false)}
              disabled={reviewLoading}
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewLoading || reviewRating === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#b8923e] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {reviewLoading ? (
                <>
                  <Spinner size="sm" color="white" />
                  Submitting…
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
