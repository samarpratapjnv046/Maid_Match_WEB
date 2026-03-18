import Razorpay from 'razorpay';
import crypto from 'crypto';
import { AppError } from '../utils/errorHandler.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Calculates commission and worker payout.
 * Commission rate: 10% for bookings <= ₹1000, 15% for <= ₹5000, 20% above.
 */
export const calculateCommission = (baseAmount) => {
  let commissionRate;
  if (baseAmount <= 1000) commissionRate = 0.10;
  else if (baseAmount <= 5000) commissionRate = 0.15;
  else commissionRate = 0.20;

  const platformCommission = Math.round(baseAmount * commissionRate);
  const workerPayout = baseAmount - platformCommission;
  return { commissionRate, platformCommission, workerPayout };
};

/**
 * Creates a Razorpay order.
 * amount is in INR (will be converted to paise).
 */
export const createRazorpayOrder = async (amountINR, bookingId, userId) => {
  const amountPaise = Math.round(amountINR * 100);
  const options = {
    amount: amountPaise,
    currency: 'INR',
    receipt: `booking_${bookingId}`,
    notes: {
      booking_id: bookingId.toString(),
      user_id: userId.toString(),
    },
  };

  const order = await razorpay.orders.create(options);
  return order;
};

/**
 * Verifies Razorpay payment signature.
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

/**
 * Verifies Razorpay webhook signature.
 */
export const verifyWebhookSignature = (rawBody, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
};

/**
 * Initiates a refund via Razorpay.
 * @param {string} paymentId - Razorpay payment_id
 * @param {number} amountPaise - amount in paise (null = full refund)
 */
export const initiateRefund = async (paymentId, amountPaise = null, reason = '') => {
  const refundOptions = { speed: 'normal', notes: { reason } };
  if (amountPaise) refundOptions.amount = amountPaise;
  const refund = await razorpay.payments.refund(paymentId, refundOptions);
  return refund;
};
