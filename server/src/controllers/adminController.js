import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import AuditLog from '../models/AuditLog.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/errorHandler.js';
import { sendWorkerVerifiedEmail, sendRefundConfirmationEmail, sendWithdrawalApprovedEmail } from '../utils/email.js';

const logAction = async (adminId, action, entityType, entityId, before, after, note, ip) => {
  await AuditLog.create({ admin_id: adminId, action, entity_type: entityType, entity_id: entityId, before_state: before, after_state: after, note, ip_address: ip });
};

// ─── USERS ────────────────────────────────────────────────────────────────────

// @route GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, is_banned, page, limit, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (is_banned !== undefined) filter.is_banned = is_banned === 'true';
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), data: users });
  } catch (err) { next(err); }
};

// @route PATCH /api/admin/users/:id/ban
export const banUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));
    if (user.role === 'admin') return next(new AppError('Cannot ban an admin.', 403));

    const before = { is_banned: user.is_banned };
    user.is_banned = true;
    user.ban_reason = reason || 'Violated terms of service.';
    await user.save();

    await logAction(req.user._id, 'BAN_USER', 'user', user._id, before, { is_banned: true }, reason, req.ip);
    res.json({ success: true, message: `User ${user.email} has been banned.` });
  } catch (err) { next(err); }
};

// @route PATCH /api/admin/users/:id/unban
export const unbanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));

    const before = { is_banned: user.is_banned };
    user.is_banned = false;
    user.ban_reason = '';
    await user.save();

    await logAction(req.user._id, 'UNBAN_USER', 'user', user._id, before, { is_banned: false }, 'Unbanned by admin', req.ip);
    res.json({ success: true, message: `User ${user.email} has been unbanned.` });
  } catch (err) { next(err); }
};

// ─── WORKERS ──────────────────────────────────────────────────────────────────

// @route GET /api/admin/workers
export const getAllWorkers = async (req, res, next) => {
  try {
    const { verification_status, page, limit } = req.query;
    const filter = {};
    if (verification_status) filter.verification_status = verification_status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [workers, total] = await Promise.all([
      Worker.find(filter)
        .select('+aadhaar.url +aadhaar.public_id +aadhaar.verified')
        .populate('user_id', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Worker.countDocuments(filter),
    ]);
    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), data: workers });
  } catch (err) { next(err); }
};

// @route GET /api/admin/workers/:id
export const getWorkerDetail = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .select('+aadhaar.url +aadhaar.public_id +aadhaar.number +aadhaar.verified +aadhaar.submitted_at')
      .populate('user_id', 'name email phone profilePhoto');

    if (!worker) return next(new AppError('Worker not found.', 404));
    res.json({ success: true, data: worker });
  } catch (err) { next(err); }
};

// @route PATCH /api/admin/workers/:id/verify
export const verifyWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('user_id', 'name email');
    if (!worker) return next(new AppError('Worker not found.', 404));

    const before = { verification_status: worker.verification_status, is_verified: worker.is_verified };
    worker.is_verified = true;
    worker.verification_status = 'verified';
    worker.aadhaar.verified = true;
    worker.rejection_reason = '';
    await worker.save();

    await logAction(req.user._id, 'VERIFY_WORKER', 'worker', worker._id, before, { is_verified: true }, 'Worker verified', req.ip);

    // Send congratulations email to the worker (non-blocking)
    if (worker.user_id?.email) {
      sendWorkerVerifiedEmail(worker.user_id.email, worker.user_id.name || 'there').catch((err) =>
        console.error('Failed to send worker verified email:', err.message)
      );
    }

    res.json({ success: true, message: 'Worker verified successfully.' });
  } catch (err) { next(err); }
};

// @route PATCH /api/admin/workers/:id/reject
export const rejectWorker = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) return next(new AppError('Rejection reason is required.', 400));

    const worker = await Worker.findById(req.params.id);
    if (!worker) return next(new AppError('Worker not found.', 404));

    const before = { verification_status: worker.verification_status };
    worker.is_verified = false;
    worker.verification_status = 'rejected';
    worker.rejection_reason = reason;
    await worker.save();

    await logAction(req.user._id, 'REJECT_WORKER', 'worker', worker._id, before, { is_verified: false, rejection_reason: reason }, reason, req.ip);
    res.json({ success: true, message: 'Worker rejected.' });
  } catch (err) { next(err); }
};

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────

// @route GET /api/admin/bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user_id', 'name email')
        .populate({ path: 'worker_id', select: '-aadhaar', populate: { path: 'user_id', select: 'name email' } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(filter),
    ]);
    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), data: bookings });
  } catch (err) { next(err); }
};

// ─── PAYMENTS & REVENUE ───────────────────────────────────────────────────────

// @route GET /api/admin/payments
export const getAllPayments = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('user_id', 'name email')
        .populate({ path: 'worker_id', select: 'user_id', populate: { path: 'user_id', select: 'name email' } })
        .populate('booking_id', 'service_type status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Payment.countDocuments(filter),
    ]);
    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), data: payments });
  } catch (err) { next(err); }
};

// @route GET /api/admin/revenue
export const getRevenueStats = async (req, res, next) => {
  try {
    const stats = await Payment.aggregate([
      { $match: { status: 'captured' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalCommission: { $sum: '$platform_commission' },
          totalWorkerPayout: { $sum: '$worker_payout' },
          count: { $sum: 1 },
        },
      },
    ]);

    const bookingStats = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        revenue: stats[0] || { totalRevenue: 0, totalCommission: 0, totalWorkerPayout: 0, count: 0 },
        bookings_by_status: bookingStats,
      },
    });
  } catch (err) { next(err); }
};

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

// @route GET /api/admin/reviews
export const getAllReviews = async (req, res, next) => {
  try {
    const { page, limit, is_visible } = req.query;
    const filter = {};
    if (is_visible !== undefined) filter.is_visible = is_visible === 'true';

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user_id', 'name')
        .populate({ path: 'worker_id', select: 'user_id', populate: { path: 'user_id', select: 'name' } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(filter),
    ]);
    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), data: reviews });
  } catch (err) { next(err); }
};

// @route PATCH /api/admin/reviews/:id/hide
export const hideReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found.', 404));

    const show = req.query.show === 'true';
    const prev = { is_visible: review.is_visible };
    review.is_visible = show;
    await review.save();

    await logAction(req.user._id, show ? 'SHOW_REVIEW' : 'HIDE_REVIEW', 'review', review._id, prev, { is_visible: show }, req.body.reason || '', req.ip);
    res.json({ success: true, message: show ? 'Review is now visible.' : 'Review hidden.' });
  } catch (err) { next(err); }
};

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────

// @route GET /api/admin/audit-logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, action, entity_type } = req.query;
    const filter = {};
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (entity_type) filter.entity_type = entity_type;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('admin_id', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), data: logs });
  } catch (err) { next(err); }
};

// ─── WITHDRAWALS ──────────────────────────────────────────────────────────────

// @route GET /api/admin/withdrawals
export const getAllWithdrawals = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [withdrawals, total] = await Promise.all([
      WithdrawalRequest.find(filter)
        .populate({ path: 'worker_id', select: 'user_id wallet_balance', populate: { path: 'user_id', select: 'name email phone' } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      WithdrawalRequest.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), data: withdrawals });
  } catch (err) { next(err); }
};

// @route PATCH /api/admin/withdrawals/:id/approve
export const approveWithdrawal = async (req, res, next) => {
  try {
    const { utr_number, admin_notes } = req.body;

    // Plain fetch first — no populate to avoid save issues
    const withdrawal = await WithdrawalRequest.findById(req.params.id);
    if (!withdrawal) return next(new AppError('Withdrawal request not found.', 404));
    if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
      return next(new AppError('This withdrawal has already been finalised.', 400));
    }

    // Fetch worker separately to deduct wallet
    const worker = await Worker.findById(withdrawal.worker_id)
      .populate('user_id', 'name email');
    if (!worker) return next(new AppError('Worker not found.', 404));

    if (worker.wallet_balance < withdrawal.amount) {
      return next(new AppError(
        `Insufficient worker balance (₹${worker.wallet_balance.toFixed(2)}) to cover withdrawal of ₹${withdrawal.amount}.`, 400,
      ));
    }

    const balanceBefore = worker.wallet_balance;
    const balanceAfter  = balanceBefore - withdrawal.amount;

    // Deduct wallet
    worker.wallet_balance = balanceAfter;
    await worker.save();

    // Record transaction
    await Transaction.create({
      worker_id:    worker._id,
      type:         'debit',
      amount:       withdrawal.amount,
      balance_after: balanceAfter,
      description:  `Withdrawal approved — UTR: ${utr_number || 'N/A'}`,
    });

    // Atomic update of withdrawal record
    await WithdrawalRequest.findByIdAndUpdate(withdrawal._id, {
      $set: {
        status:       'completed',
        utr_number:   utr_number || '',
        admin_notes:  admin_notes || '',
        processed_at: new Date(),
      },
    });

    await logAction(req.user._id, 'APPROVE_WITHDRAWAL', 'withdrawal', withdrawal._id,
      { status: withdrawal.status },
      { status: 'completed', utr_number },
      admin_notes, req.ip,
    );

    // Email worker
    if (worker.user_id?.email) {
      sendWithdrawalApprovedEmail(
        worker.user_id.email,
        worker.user_id.name,
        withdrawal.amount,
        utr_number || 'N/A',
        withdrawal.bank_snapshot?.bank_name || '',
      ).catch(() => {});
    }

    res.json({ success: true, message: 'Withdrawal approved. Amount deducted from wallet and worker notified.' });
  } catch (err) { next(err); }
};

// @route PATCH /api/admin/withdrawals/:id/reject
export const rejectWithdrawal = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const withdrawal = await WithdrawalRequest.findById(req.params.id);

    if (!withdrawal) return next(new AppError('Withdrawal request not found.', 404));
    if (withdrawal.status === 'completed' || withdrawal.status === 'rejected') {
      return next(new AppError('This withdrawal has already been finalised.', 400));
    }

    const before = { status: withdrawal.status };

    await WithdrawalRequest.findByIdAndUpdate(withdrawal._id, {
      $set: {
        status: 'rejected',
        rejection_reason: reason || 'Rejected by admin.',
        processed_at: new Date(),
      },
    });

    await logAction(req.user._id, 'REJECT_WITHDRAWAL', 'withdrawal', withdrawal._id, before, { status: 'rejected' }, reason, req.ip);
    res.json({ success: true, message: 'Withdrawal request rejected.' });
  } catch (err) { next(err); }
};

// @route PATCH /api/admin/withdrawals/:id/processing
export const markWithdrawalProcessing = async (req, res, next) => {
  try {
    const withdrawal = await WithdrawalRequest.findById(req.params.id);
    if (!withdrawal) return next(new AppError('Withdrawal request not found.', 404));
    if (withdrawal.status !== 'pending') return next(new AppError('Only pending requests can be marked as processing.', 400));

    withdrawal.status = 'processing';
    await withdrawal.save();

    res.json({ success: true, message: 'Withdrawal marked as processing.' });
  } catch (err) { next(err); }
};

// ─── REFUND REQUESTS ─────────────────────────────────────────────────────────

// @route GET /api/admin/refund-requests
export const getRefundRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { status: 'cancellation_requested' };
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('user_id', 'name email phone'),
      Booking.countDocuments(filter),
    ]);

    res.json({ success: true, total, data: bookings });
  } catch (err) { next(err); }
};

// @route PATCH /api/admin/refund-requests/:bookingId/process
export const processManualRefund = async (req, res, next) => {
  try {
    const { utr_number, admin_notes } = req.body;
    if (!utr_number?.trim()) {
      return next(new AppError('UTR / transaction reference number is required.', 400));
    }

    // Step 1: plain fetch (no populate) — just to check status
    const existing = await Booking.findById(req.params.bookingId);
    if (!existing) return next(new AppError('Booking not found.', 404));
    if (existing.status !== 'cancellation_requested') {
      return next(new AppError(
        `This booking is not pending a refund (current status: ${existing.status}).`, 400,
      ));
    }

    // Step 2: atomic update — avoids populate-then-save cast issues
    const updated = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      {
        $set: {
          status:             'refunded',
          refund_utr:         utr_number.trim(),
          refund_admin_notes: admin_notes?.trim() || '',
          refunded_at:        new Date(),
        },
        $push: {
          status_history: {
            status:     'refunded',
            changed_by: req.user._id,
            changed_at: new Date(),
            note:       `Manual refund processed by admin. UTR: ${utr_number.trim()}`,
          },
        },
      },
      { new: true, runValidators: false },
    );

    await logAction(
      req.user._id, 'MANUAL_REFUND', 'Booking', updated._id,
      { status: 'cancellation_requested' },
      { status: 'refunded', utr_number },
      `Manual refund — UTR: ${utr_number}`,
      req.ip,
    );

    // Step 3: fetch customer + price data separately for the email
    const forEmail = await Booking.findById(updated._id)
      .populate('user_id', 'name email');

    if (forEmail?.user_id?.email) {
      const price     = forEmail.price || {};
      const refundAmt = price.worker_payout != null
        ? Number(price.worker_payout)
        : Number(price.base_amount ?? 0) - Number(price.platform_commission ?? 0);

      sendRefundConfirmationEmail(
        forEmail.user_id.email,
        forEmail.user_id.name,
        refundAmt.toFixed(2),
        utr_number.trim(),
        forEmail.refund_bank_details?.bank_name || '',
        forEmail._id,
      ).catch(() => {});
    }

    res.json({ success: true, message: 'Refund marked as processed and customer notified.', data: updated });
  } catch (err) { next(err); }
};
