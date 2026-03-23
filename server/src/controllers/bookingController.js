import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import Transaction from '../models/Transaction.js';
import Message from '../models/Message.js';
import Offer from '../models/Offer.js';
import { generateAndStoreOTP, verifyOTP } from '../services/otpService.js';
import { calculateCommission, calculateDistanceCharge, MAX_DISTANCE_KM } from '../services/paymentService.js';
import { getDistanceBetweenPincodes } from '../utils/geocodeService.js';
import { AppError } from '../utils/errorHandler.js';

const pushStatus = (booking, status, userId, note = '') => {
  booking.status_history.push({ status, changed_by: userId, note });
  booking.status = status;
};

// @desc    Create booking request
// @route   POST /api/bookings
// @access  Private (customer)
export const createBooking = async (req, res, next) => {
  try {
    const { worker_id, service_type, duration_type, start_time, end_time, address, special_instructions, coupon_code } = req.body;

    const worker = await Worker.findById(worker_id);
    if (!worker) return next(new AppError('Worker not found.', 404));

    // Prevent a worker from booking themselves
    if (req.user.role === 'worker' && worker.user_id.equals(req.user._id)) {
      return next(new AppError('You cannot book yourself.', 400));
    }

    if (!worker.is_verified || !worker.is_available) {
      return next(new AppError('Worker is not available for bookings.', 400));
    }
    if (!worker.services.includes(service_type)) {
      return next(new AppError(`Worker does not offer the service: ${service_type}.`, 400));
    }

    // Prevent duplicate pending bookings
    const duplicate = await Booking.findOne({
      user_id: req.user._id,
      worker_id,
      status: { $in: ['offer_pending', 'accepted', 'pending_payment', 'paid'] },
    });
    if (duplicate) {
      return next(new AppError('You already have an active booking with this worker.', 409));
    }

    // Calculate price
    const start = new Date(start_time);
    const end = new Date(end_time);
    const diffMs = end - start;

    let baseAmount;
    if (duration_type === 'hourly') {
      const hours = diffMs / (1000 * 60 * 60);
      baseAmount = Math.round(hours * worker.pricing.hourly);
    } else if (duration_type === 'daily') {
      const days = diffMs / (1000 * 60 * 60 * 24);
      baseAmount = Math.round(days * worker.pricing.daily);
    } else {
      const months = diffMs / (1000 * 60 * 60 * 24 * 30);
      baseAmount = Math.round(months * worker.pricing.monthly);
    }

    if (baseAmount <= 0) return next(new AppError('Invalid time range for duration type.', 400));

    // Distance-based surcharge
    const workerPincode = worker.location?.pincode;
    const customerPincode = address?.pincode;

    if (!workerPincode || !customerPincode) {
      return next(new AppError('Both worker and customer pincodes are required to calculate the distance charge.', 400));
    }

    let distanceKm = 0;
    let distanceCharge = 0;
    try {
      distanceKm = await getDistanceBetweenPincodes(workerPincode, customerPincode);
    } catch (geoErr) {
      return next(new AppError(`Could not calculate distance: ${geoErr.message}`, 400));
    }

    if (distanceKm > MAX_DISTANCE_KM) {
      return next(
        new AppError(
          `The worker is ${distanceKm} km away. Bookings are only allowed within ${MAX_DISTANCE_KM} km.`,
          400
        )
      );
    }

    distanceCharge = calculateDistanceCharge(distanceKm);
    const totalAmount = baseAmount + distanceCharge;

    // ── Coupon validation (coupon codes live inside Offers) ────────────────────
    let couponDiscount = 0;
    let appliedCouponCode = '';
    if (coupon_code) {
      const offer = await Offer.findOne({ coupon_code: coupon_code.toUpperCase().trim() });
      if (!offer || !offer.coupon_code) return next(new AppError('Invalid coupon code.', 400));
      if (!offer.is_active) return next(new AppError('This coupon is no longer active.', 400));
      if (offer.expires_at && new Date(offer.expires_at) < new Date()) {
        return next(new AppError('This coupon has expired.', 400));
      }
      if (offer.usage_limit !== null && offer.used_count >= offer.usage_limit) {
        return next(new AppError('This coupon has reached its usage limit.', 400));
      }
      if (totalAmount < offer.min_order_value) {
        return next(
          new AppError(
            `This coupon requires a minimum booking amount of ₹${offer.min_order_value}.`,
            400
          )
        );
      }

      if (offer.discount_type === 'percentage') {
        couponDiscount = Math.round((totalAmount * offer.discount_value) / 100);
        if (offer.max_discount) couponDiscount = Math.min(couponDiscount, offer.max_discount);
      } else {
        couponDiscount = Math.min(offer.discount_value, totalAmount);
      }
      appliedCouponCode = offer.coupon_code;

      // Increment usage counter on the offer
      await Offer.findByIdAndUpdate(offer._id, { $inc: { used_count: 1 } });
    }

    const finalAmount = totalAmount - couponDiscount;
    const { commissionRate, platformCommission, workerPayout } = calculateCommission(totalAmount);

    // Platform absorbs the coupon discount (reduce its commission, worker payout unchanged)
    const adjustedCommission = Math.max(0, platformCommission - couponDiscount);

    const booking = await Booking.create({
      user_id: req.user._id,
      worker_id,
      service_type,
      duration_type,
      start_time,
      end_time,
      address,
      special_instructions,
      price: {
        base_amount: totalAmount,
        distance_km: distanceKm,
        distance_charge: distanceCharge,
        coupon_code: appliedCouponCode,
        coupon_discount: couponDiscount,
        final_amount: finalAmount,
        platform_commission: adjustedCommission,
        commission_rate: commissionRate,
        worker_payout: workerPayout,
      },
      status: 'offer_pending',
      status_history: [{ status: 'offer_pending', changed_by: req.user._id, note: 'Booking created' }],
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Worker accepts or rejects booking
// @route   PATCH /api/bookings/:id/respond
// @access  Private (worker)
export const respondToBooking = async (req, res, next) => {
  try {
    const { action, rejection_reason } = req.body;

    const worker = await Worker.findOne({ user_id: req.user._id });
    if (!worker) return next(new AppError('Worker profile not found.', 404));

    const booking = await Booking.findOne({ _id: req.params.id, worker_id: worker._id });
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.status !== 'offer_pending') {
      return next(new AppError(`Cannot respond to a booking with status: ${booking.status}.`, 400));
    }

    if (action === 'accept') {
      pushStatus(booking, 'accepted', req.user._id, 'Worker accepted');
    } else {
      booking.rejection_reason = rejection_reason || 'No reason provided.';
      pushStatus(booking, 'rejected', req.user._id, rejection_reason);
    }

    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings for current user
// @route   GET /api/bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const filter = {};

    if (req.user.role === 'customer' || (req.user.role === 'worker' && req.query.view === 'customer')) {
      filter.user_id = req.user._id;
    } else if (req.user.role === 'worker') {
      const worker = await Worker.findOne({ user_id: req.user._id });
      if (!worker) return next(new AppError('Worker profile not found.', 404));
      filter.worker_id = worker._id;
    }

    if (status) {
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
      filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user_id', 'name phone')
        .populate({ path: 'worker_id', select: '-aadhaar', populate: { path: 'user_id', select: 'name phone profilePhoto' } }),
      Booking.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), data: bookings });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user_id', 'name phone email address')
      .populate({ path: 'worker_id', select: '-aadhaar', populate: { path: 'user_id', select: 'name phone email profilePhoto' } })
      .populate('payment_id');

    if (!booking) return next(new AppError('Booking not found.', 404));

    // Ownership check
    const worker = req.user.role === 'worker' ? await Worker.findOne({ user_id: req.user._id }) : null;
    const isOwner =
      req.user.role === 'admin' ||
      booking.user_id._id.equals(req.user._id) ||
      (worker && booking.worker_id._id.equals(worker._id));

    if (!isOwner) return next(new AppError('Access denied.', 403));

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Worker verifies OTP to complete job
// @route   POST /api/bookings/:id/complete
// @access  Private (worker)
export const completeBookingWithOTP = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { otp } = req.body;
    const worker = await Worker.findOne({ user_id: req.user._id }).session(session);
    if (!worker) return next(new AppError('Worker profile not found.', 404));

    const booking = await Booking.findOne({ _id: req.params.id, worker_id: worker._id }).session(session);
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.status !== 'paid') {
      return next(new AppError(`Cannot complete booking with status: ${booking.status}.`, 400));
    }

    // Verify OTP
    await verifyOTP(booking._id.toString(), otp);

    // Mark booking complete
    pushStatus(booking, 'completed', req.user._id, 'OTP verified by worker');
    await booking.save({ session });

    // Credit worker wallet
    const workerPayout = booking.price.worker_payout;
    const balanceAfter = worker.wallet_balance + workerPayout;
    worker.wallet_balance = balanceAfter;
    worker.total_bookings += 1;
    await worker.save({ session });

    // Create transaction record
    await Transaction.create(
      [
        {
          worker_id: worker._id,
          booking_id: booking._id,
          payment_id: booking.payment_id,
          type: 'credit',
          amount: workerPayout,
          balance_after: balanceAfter,
          description: `Earnings for booking ${booking._id}`,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Delete chat messages now that the booking is complete
    await Message.deleteMany({ booking_id: booking._id });

    res.json({ success: true, message: 'Booking completed. Earnings credited to wallet.', data: booking });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// @desc    Cancel a booking (customer only, before payment)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (customer)
export const cancelBooking = async (req, res, next) => {
  try {
    const { reason, refund_bank_details } = req.body;

    // Find booking — customer must own it, worker must be the assigned worker
    let booking;
    if (req.user.role === 'worker') {
      const workerProfile = await Worker.findOne({ user_id: req.user._id });
      if (!workerProfile) return next(new AppError('Worker profile not found.', 404));
      booking = await Booking.findOne({ _id: req.params.id, worker_id: workerProfile._id });
    } else {
      booking = await Booking.findOne({ _id: req.params.id, user_id: req.user._id });
    }

    if (!booking) return next(new AppError('Booking not found.', 404));

    const cancellableStatuses = ['offer_pending', 'accepted', 'pending_payment', 'paid'];
    if (!cancellableStatuses.includes(booking.status)) {
      return next(new AppError(`Cannot cancel booking with status: ${booking.status}.`, 400));
    }

    const cancelledBy = req.user.role === 'worker' ? 'worker' : 'customer';
    const cancelNote  = reason ? `Cancelled by ${cancelledBy}: ${reason}` : `Cancelled by ${cancelledBy}`;

    // ── Paid booking: request manual refund — collect bank details ───────────
    if (booking.status === 'paid') {
      const { account_holder_name, account_number, ifsc_code, bank_name } = refund_bank_details || {};
      if (!account_holder_name || !account_number || !ifsc_code || !bank_name) {
        return next(new AppError('Bank account details are required to process a refund.', 400));
      }

      booking.refund_bank_details = { account_holder_name, account_number, ifsc_code, bank_name };
      booking.cancellation_reason = cancelNote;
      pushStatus(booking, 'cancellation_requested', req.user._id, cancelNote);
      await booking.save();

      await Message.deleteMany({ booking_id: booking._id });

      return res.json({
        success: true,
        message: 'Cancellation request submitted. Our team will review and transfer the refund to your bank account within 3–5 business days.',
        data: booking,
      });
    }

    // ── Unpaid bookings: cancel immediately ──────────────────────────────────
    booking.cancellation_reason = cancelNote;
    pushStatus(booking, 'cancelled', req.user._id, cancelNote);
    await booking.save();

    await Message.deleteMany({ booking_id: booking._id });

    res.json({ success: true, message: 'Booking cancelled successfully.', data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a booking (all roles — each can only delete their own)
// @route   DELETE /api/bookings/:id
// @access  Private (customer, worker, admin)
export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found.', 404));

    // Ownership check — workers can delete either as provider or as customer-booker
    if (req.user.role === 'customer') {
      if (!booking.user_id.equals(req.user._id)) {
        return next(new AppError('Access denied.', 403));
      }
    } else if (req.user.role === 'worker') {
      const isBooker = booking.user_id.equals(req.user._id);
      const workerProfile = await Worker.findOne({ user_id: req.user._id });
      const isProvider = workerProfile && booking.worker_id.equals(workerProfile._id);
      if (!isBooker && !isProvider) {
        return next(new AppError('Access denied.', 403));
      }
    }
    // admin can delete any booking

    await booking.deleteOne();
    res.json({ success: true, message: 'Booking deleted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Preview distance and surcharge between two pincodes
// @route   GET /api/bookings/distance-preview?customerPincode=xxx&workerPincode=yyy
// @access  Private
export const getDistancePreview = async (req, res, next) => {
  try {
    const { customerPincode, workerPincode } = req.query;

    if (!customerPincode || !workerPincode) {
      return next(new AppError('Both customerPincode and workerPincode are required.', 400));
    }

    let distanceKm;
    try {
      distanceKm = await getDistanceBetweenPincodes(workerPincode, customerPincode);
    } catch (geoErr) {
      return next(new AppError(`Could not resolve pincode: ${geoErr.message}`, 400));
    }

    const distanceCharge = calculateDistanceCharge(distanceKm);
    const withinLimit = distanceKm <= MAX_DISTANCE_KM;

    res.json({
      success: true,
      data: {
        distance_km: distanceKm,
        distance_charge: distanceCharge,
        within_limit: withinLimit,
        max_distance_km: MAX_DISTANCE_KM,
        charge_per_km: 4,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit a review for completed booking
// @route   POST /api/bookings/:id/review
// @access  Private (customer)
export const submitReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.status !== 'completed') {
      return next(new AppError('You can only review completed bookings.', 400));
    }
    if (booking.review_id) {
      return next(new AppError('Review already submitted for this booking.', 409));
    }

    const review = await Review.create({
      booking_id: booking._id,
      user_id: req.user._id,
      worker_id: booking.worker_id,
      rating,
      comment,
    });

    booking.review_id = review._id;
    await booking.save();

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};
