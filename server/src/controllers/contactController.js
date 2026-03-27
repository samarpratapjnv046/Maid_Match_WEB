import ContactMessage from '../models/ContactMessage.js';
import { AppError } from '../utils/errorHandler.js';

// @desc    Submit a contact message (public)
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return next(new AppError('All fields are required.', 400));
    }
    if (message.trim().length < 20) {
      return next(new AppError('Message must be at least 20 characters.', 400));
    }

    const doc = await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ success: true, message: 'Message received. We will get back to you shortly.', data: doc });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all contact messages with pagination (admin only)
// @route   GET /api/contact?page=1&limit=20&unreadOnly=true
// @access  Private/Admin
export const getContactMessages = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.unreadOnly === 'true') filter.isRead = false;

    const [messages, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactMessage.countDocuments(filter),
    ]);

    const unreadCount = await ContactMessage.countDocuments({ isRead: false });

    res.json({
      success: true,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit),
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a message as read (admin only)
// @route   PATCH /api/contact/:id/read
// @access  Private/Admin
export const markAsRead = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!msg) return next(new AppError('Message not found.', 404));
    res.json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a contact message (admin only)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContactMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return next(new AppError('Message not found.', 404));
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    next(err);
  }
};
