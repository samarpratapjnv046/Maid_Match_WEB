import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Worker from '../models/Worker.js';
import Transaction from '../models/Transaction.js';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  initiateRefund,
} from '../services/paymentService.js';
import { generateAndStoreOTP } from '../services/otpService.js';
import { AppError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private (customer)
export const createOrder = async (req, res, next) => {
  try {
    const { booking_id } = req.body;

    const booking = await Booking.findOne({ _id: booking_id, user_id: req.user._id });
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.status !== 'accepted') {
      return next(new AppError('Payment can only be initiated for accepted bookings.', 400));
    }

    // Prevent duplicate order creation
    const existingPayment = await Payment.findOne({ booking_id, status: { $in: ['created', 'authorized', 'captured'] } });
    if (existingPayment) {
      return res.json({ success: true, order_id: existingPayment.razorpay_order_id, amount: existingPayment.amount });
    }

    const order = await createRazorpayOrder(
      booking.price.base_amount,
      booking._id,
      req.user._id
    );

    const payment = await Payment.create({
      booking_id: booking._id,
      user_id: req.user._id,
      worker_id: booking.worker_id,
      razorpay_order_id: order.id,
      amount: order.amount, // paise
      platform_commission: booking.price.platform_commission * 100,
      worker_payout: booking.price.worker_payout * 100,
    });

    // Update booking status
    booking.status = 'pending_payment';
    booking.payment_id = payment._id;
    booking.status_history.push({ status: 'pending_payment', changed_by: req.user._id, note: 'Razorpay order created' });
    await booking.save();

    res.status(201).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify payment & generate completion OTP
// @route   POST /api/payments/verify
// @access  Private (customer)
export const verifyPayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

    // Verify signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      await session.abortTransaction();
      return next(new AppError('Payment signature verification failed. Possible fraud attempt.', 400));
    }

    const payment = await Payment.findOne({ razorpay_order_id }).session(session);
    if (!payment) {
      await session.abortTransaction();
      return next(new AppError('Payment record not found.', 404));
    }
    if (payment.status === 'captured') {
      await session.abortTransaction();
      return res.json({ success: true, message: 'Payment already captured.' });
    }

    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.status = 'captured';
    await payment.save({ session });

    const booking = await Booking.findById(booking_id).session(session);
    booking.status = 'paid';
    booking.status_history.push({ status: 'paid', changed_by: req.user._id, note: 'Payment captured' });
    await booking.save({ session });

    // Generate completion OTP
    const otp = await generateAndStoreOTP(booking._id.toString());

    await session.commitTransaction();

    // Return OTP to customer (in production: send via SMS/notification)
    res.json({
      success: true,
      message: 'Payment successful! Share this OTP with your worker when they arrive.',
      otp, // In production, send via SMS — returned here for development
      booking_id: booking._id,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// @desc    Process refund
// @route   POST /api/payments/:bookingId/refund
// @access  Private (admin or system)
export const processRefund = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.bookingId).session(session);
    if (!booking) return next(new AppError('Booking not found.', 404));

    const refundableStatuses = ['paid', 'accepted'];
    if (!refundableStatuses.includes(booking.status)) {
      await session.abortTransaction();
      return next(new AppError(`Cannot refund booking with status: ${booking.status}.`, 400));
    }

    const payment = await Payment.findById(booking.payment_id).session(session);
    if (!payment || payment.status !== 'captured') {
      await session.abortTransaction();
      return next(new AppError('No captured payment found for this booking.', 404));
    }

    const refund = await initiateRefund(payment.razorpay_payment_id, null, reason);

    payment.status = 'refunded';
    payment.refund_id = refund.id;
    payment.refund_amount = refund.amount;
    payment.refund_reason = reason || 'Refund requested';
    payment.refunded_at = new Date();
    await payment.save({ session });

    booking.status = 'refunded';
    booking.status_history.push({ status: 'refunded', changed_by: req.user._id, note: reason || 'Refund processed' });
    await booking.save({ session });

    // If worker payout was credited, debit wallet
    const worker = await Worker.findById(booking.worker_id).session(session);
    if (worker && booking.status === 'completed') {
      const payout = booking.price.worker_payout;
      worker.wallet_balance = Math.max(0, worker.wallet_balance - payout);
      await worker.save({ session });

      await Transaction.create(
        [
          {
            worker_id: worker._id,
            booking_id: booking._id,
            payment_id: payment._id,
            type: 'refund_debit',
            amount: payout,
            balance_after: worker.wallet_balance,
            description: `Refund deduction for booking ${booking._id}`,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    res.json({ success: true, message: 'Refund initiated successfully.', refund_id: refund.id });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// @desc    Razorpay webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Razorpay servers)
export const razorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = JSON.stringify(req.body);

    if (!verifyWebhookSignature(rawBody, signature)) {
      logger.warn('Invalid Razorpay webhook signature');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const { order_id, id: payment_id } = payload.payment.entity;
      await Payment.findOneAndUpdate(
        { razorpay_order_id: order_id },
        { razorpay_payment_id: payment_id, status: 'captured', webhook_verified: true }
      );
      logger.info(`Webhook: payment.captured — order ${order_id}`);
    }

    if (event === 'refund.created') {
      const { payment_id, id: refund_id, amount } = payload.refund.entity;
      await Payment.findOneAndUpdate(
        { razorpay_payment_id: payment_id },
        { refund_id, refund_amount: amount, status: 'refunded', refunded_at: new Date() }
      );
      logger.info(`Webhook: refund.created — payment ${payment_id}`);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    logger.error('Webhook error:', err);
    next(err);
  }
};
