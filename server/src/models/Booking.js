import mongoose from 'mongoose';

const BOOKING_STATUSES = [
  'offer_pending',
  'accepted',
  'rejected',
  'pending_payment',
  'paid',
  'completed',
  'cancelled',
  'cancellation_requested',
  'refunded',
];

const bookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    service_type: {
      type: String,
      required: [true, 'Service type is required'],
    },
    duration_type: {
      type: String,
      enum: ['hourly', 'daily', 'monthly'],
      required: [true, 'Duration type is required'],
    },
    start_time: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    end_time: {
      type: Date,
      required: [true, 'End time is required'],
    },
    price: {
      base_amount: { type: Number, required: true },
      distance_km: { type: Number, default: 0 },
      distance_charge: { type: Number, default: 0 },
      platform_commission: { type: Number, required: true },
      commission_rate: { type: Number, required: true }, // 0.10 - 0.20
      worker_payout: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    special_instructions: { type: String, maxlength: 500, default: '' },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'offer_pending',
    },
    status_history: [
      {
        status: { type: String, enum: BOOKING_STATUSES },
        changed_at: { type: Date, default: Date.now },
        changed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String },
      },
    ],
    // OTP for job completion
    completion_otp: {
      hash: { type: String, select: false },
      expires_at: { type: Date, select: false },
      is_used: { type: Boolean, default: false, select: false },
    },
    rejection_reason: { type: String, default: '' },
    cancellation_reason: { type: String, default: '' },
    // Bank details provided by customer when requesting a refund
    refund_bank_details: {
      account_holder_name: { type: String, default: '' },
      account_number:      { type: String, default: '' },
      ifsc_code:           { type: String, default: '' },
      bank_name:           { type: String, default: '' },
    },
    // Set by admin when processing manual refund
    refund_utr:         { type: String, default: '' },
    refund_admin_notes: { type: String, default: '' },
    refunded_at:        { type: Date },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    review_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      default: null,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user_id: 1 });
bookingSchema.index({ worker_id: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ user_id: 1, worker_id: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
