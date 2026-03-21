import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import AuditLog from '../models/AuditLog.js';
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/errorHandler.js';
import { sendWorkerVerifiedEmail } from '../utils/email.js';

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
