import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
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
    razorpay_order_id: {
      type: String,
      required: true,
      unique: true,
    },
    razorpay_payment_id: {
      type: String,
      default: null,
    },
    razorpay_signature: {
      type: String,
      select: false,
      default: null,
    },
    amount: { type: Number, required: true }, // in paise
    currency: { type: String, default: 'INR' },
    platform_commission: { type: Number, required: true },
    worker_payout: { type: Number, required: true },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
    },
    refund_id: { type: String, default: null },
    refund_amount: { type: Number, default: 0 },
    refund_reason: { type: String, default: '' },
    refunded_at: { type: Date, default: null },
    webhook_verified: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

paymentSchema.index({ booking_id: 1 });
paymentSchema.index({ user_id: 1 });
// paymentSchema.index({ razorpay_order_id: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
