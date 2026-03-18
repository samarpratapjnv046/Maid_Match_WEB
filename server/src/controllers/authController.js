import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import { sendTokens, generateAccessToken } from '../utils/generateToken.js';
import { AppError } from '../utils/errorHandler.js';

// @desc    Register user (customer or worker)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered.', 409));
    }

    const user = await User.create({ name, email, password, phone, role });

    sendTokens(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    if (user.is_banned) {
      return next(new AppError('Your account has been suspended. Contact support.', 403));
    }

    sendTokens(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh access token using refresh token cookie
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return next(new AppError('No refresh token provided.', 401));

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return next(new AppError('Invalid or expired refresh token.', 401));
    }

    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('User not found.', 401));

    const accessToken = generateAccessToken(user._id, user.role);
    res.json({ success: true, accessToken });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update customer profile
// @route   PATCH /api/auth/me
// @access  Private
export const updateMe = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;

    if (req.file) {
      updates['profilePhoto.url'] = req.file.path;
      updates['profilePhoto.public_id'] = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PATCH /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return next(new AppError('Current password is incorrect.', 401));
    }

    user.password = newPassword;
    await user.save();

    sendTokens(user, 200, res);
  } catch (err) {
    next(err);
  }
};
