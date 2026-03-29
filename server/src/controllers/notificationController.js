import Notification from '../models/Notification.js';

const PAGE_LIMIT = 20;

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications?page=1
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * PAGE_LIMIT;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user_id: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGE_LIMIT)
        .lean(),
      Notification.countDocuments({ user_id: req.user._id }),
      Notification.countDocuments({ user_id: req.user._id, is_read: false }),
    ]);

    res.json({
      success: true,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / PAGE_LIMIT),
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get unread notification count only
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user_id: req.user._id, is_read: false });
    res.json({ success: true, unreadCount: count });
  } catch (err) {
    next(err);
  }
};

// @desc    Read a notification — deletes it immediately (non-OTP).
//          OTP notifications are left untouched here; they are removed
//          automatically when the booking is completed.
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!notif) return res.json({ success: true }); // already gone — no-op

    if (notif.type === 'otp') {
      // Only mark as read; OTP stays until work is completed
      notif.is_read = true;
      await notif.save();
    } else {
      // Delete immediately on read for all other types
      await notif.deleteOne();
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all as read — deletes non-OTP, only marks OTP as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllRead = async (req, res, next) => {
  try {
    await Promise.all([
      // Delete every non-OTP notification
      Notification.deleteMany({ user_id: req.user._id, type: { $ne: 'otp' } }),
      // Mark OTP notifications as read (keep them — removed on booking completion)
      Notification.updateMany(
        { user_id: req.user._id, type: 'otp', is_read: false },
        { is_read: true }
      ),
    ]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a single notification explicitly
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete ALL notifications for the logged-in user
// @route   DELETE /api/notifications
// @access  Private
export const deleteAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ user_id: req.user._id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
