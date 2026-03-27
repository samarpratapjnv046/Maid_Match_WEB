import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import RegisterOTP from '../models/RegisterOTP.js';
import { sendTokens, generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { AppError } from '../utils/errorHandler.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { sendOTPEmail, sendRegisterOTPEmail } from '../utils/email.js';

// @desc    Send OTP to email for registration verification
// @route   POST /api/auth/send-register-otp
// @access  Public
export const sendRegisterOTP = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) return next(new AppError('Email and name are required.', 400));

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return next(new AppError('Email already registered.', 409));

    // Re-send cooldown: allow resend only after 60s
    const existing = await RegisterOTP.findOne({ email: email.toLowerCase() });
    if (existing) {
      const sentAgo = Date.now() - (existing.expires_at.getTime() - 10 * 60 * 1000);
      if (sentAgo < 60 * 1000) {
        const wait = Math.ceil((60 * 1000 - sentAgo) / 1000);
        return next(new AppError(`Please wait ${wait}s before requesting another OTP.`, 429));
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const otp_hash = await bcrypt.hash(otp, salt);
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await RegisterOTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp_hash, expires_at, attempts: 0, locked_until: null },
      { upsert: true, new: true }
    );

    const isDev = process.env.NODE_ENV !== 'production';
    const emailConfigured =
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      !process.env.EMAIL_USER.includes('your_') &&
      !process.env.EMAIL_PASS.includes('your_');

    if (emailConfigured) {
      try {
        await sendRegisterOTPEmail(email, name, otp);
      } catch (emailErr) {
        // Roll back the OTP record so the user can try again
        await RegisterOTP.deleteOne({ email: email.toLowerCase() });
        console.error('[SendRegisterOTP] Email delivery failed:', emailErr.message);
        if (isDev) console.log(`[DEV] OTP for ${email}: ${otp}`);
        return next(new AppError('Failed to send verification email. Please try again later.', 500));
      }
    } else if (isDev) {
      console.log(`\n[DEV] Email not configured — OTP for ${email}: ${otp}\n`);
    } else {
      return next(new AppError('Email service is not configured.', 500));
    }

    res.json({
      success: true,
      message: `Verification code sent to ${email}`,
      ...(isDev && !emailConfigured && { dev_otp: otp }),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register user (customer or worker)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, pincode, otp } = req.body;

    if (!otp) return next(new AppError('Email verification OTP is required.', 400));

    // Verify OTP
    const otpRecord = await RegisterOTP.findOne({ email: email.toLowerCase() });
    if (!otpRecord) {
      return next(new AppError('No OTP found for this email. Please request a new one.', 400));
    }
    if (otpRecord.locked_until && otpRecord.locked_until > new Date()) {
      return next(new AppError('Too many incorrect attempts. Please request a new OTP.', 429));
    }
    if (otpRecord.expires_at < new Date()) {
      await RegisterOTP.deleteOne({ email: email.toLowerCase() });
      return next(new AppError('OTP has expired. Please request a new one.', 410));
    }

    const isValid = await bcrypt.compare(otp.trim(), otpRecord.otp_hash);
    if (!isValid) {
      otpRecord.attempts += 1;
      if (otpRecord.attempts >= 5) {
        otpRecord.locked_until = new Date(Date.now() + 15 * 60 * 1000);
      }
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;
      return next(new AppError(
        remaining > 0
          ? `Invalid OTP. ${remaining} attempt(s) remaining.`
          : 'OTP locked. Please request a new one.',
        400
      ));
    }

    // OTP valid — delete it
    await RegisterOTP.deleteOne({ email: email.toLowerCase() });

    // Final email uniqueness check (race condition safety)
    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError('Email already registered.', 409));

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return next(new AppError('A valid 6-digit pincode is required.', 400));
    }

    const user = await User.create({
      name, email, password, phone, role,
      address: { pincode },
    });

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

    // Preserve the active mode stored in the refresh token (not the DB role)
    const activeRole = decoded.role || user.role;
    const accessToken = generateAccessToken(user._id, activeRole);
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
    if (!user) return next(new AppError('User not found.', 404));
    // Return role from JWT (reflects active mode), not the DB field
    const data = { ...user.toObject(), role: req.user.role };
    res.json({ success: true, data });
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
      let result;
      try {
        result = await uploadToCloudinary(req.file.buffer, {
          folder: 'maidproject/profiles',
          transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        });
      } catch (cloudErr) {
        console.error('[Cloudinary]', cloudErr.message || cloudErr);
        return next(new AppError(cloudErr.message || 'Photo upload to Cloudinary failed.', 500));
      }
      updates['profilePhoto.url'] = result.secure_url;
      updates['profilePhoto.public_id'] = result.public_id;
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

// @desc    Switch active role (customer ↔ worker)
// @route   POST /api/auth/switch-mode
// @access  Private
export const switchMode = async (req, res, next) => {
  try {
    const { mode } = req.body;
    if (!['customer', 'worker'].includes(mode)) {
      return next(new AppError('Invalid mode. Must be "customer" or "worker".', 400));
    }

    // Admins cannot switch modes
    if (req.user.role === 'admin') {
      return next(new AppError('Admins cannot switch modes.', 403));
    }

    if (mode === 'worker') {
      const workerProfile = await Worker.findOne({ user_id: req.user._id });
      if (!workerProfile) {
        // Signal to frontend: redirect to profile setup
        return res.json({ success: true, needsProfile: true });
      }
    }

    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError('User not found.', 404));

    const accessToken = generateAccessToken(user._id, mode);
    // Issue a new refresh token that also carries the switched role so that
    // token-refresh and page-reload both honour the active mode.
    const newRefreshToken = generateRefreshToken(user._id, mode);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      success: true,
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: mode,
      },
    });
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

// @desc    Send OTP to email for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError('Email is required.', 400));

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond with the same message to prevent email enumeration
    const SUCCESS_MSG = 'If that email is registered, an OTP has been sent.';
    if (!user) return res.json({ success: true, message: SUCCESS_MSG });

    // Use crypto.randomBytes for cryptographically secure OTP
    const otp = String(crypto.randomInt(100000, 999999));
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    user.passwordResetToken = hashedOTP;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.passwordResetAttempts = 0; // reset attempt counter on fresh OTP
    await user.save({ validateBeforeSave: false });

    const firstName = user.name.split(' ')[0];

    try {
      await sendOTPEmail(user.email, firstName, otp);
    } catch (emailErr) {
      // Roll back the token so the DB isn't left with a dangling hash
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetAttempts = 0;
      await user.save({ validateBeforeSave: false });

      // Log in server — never expose to client
      console.error('[ForgotPassword] Email delivery failed:', emailErr.message);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] OTP for ${user.email}: ${otp}`);
      }

      return next(new AppError('Failed to send OTP email. Please try again later.', 500));
    }

    res.json({ success: true, message: SUCCESS_MSG });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return next(new AppError('Email, OTP, and new password are required.', 400));
    }
    if (newPassword.length < 8) {
      return next(new AppError('Password must be at least 8 characters.', 400));
    }

    // Find user by email with reset fields (don't hash yet — check attempts first)
    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires +passwordResetAttempts');

    if (!user || !user.passwordResetToken) {
      return next(new AppError('OTP has expired. Please request a new one.', 400));
    }

    // Enforce max 5 wrong attempts per OTP
    if (user.passwordResetAttempts >= 5) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Too many incorrect attempts. Please request a new OTP.', 429));
    }

    const hashedOTP = crypto.createHash('sha256').update(String(otp)).digest('hex');

    if (user.passwordResetToken !== hashedOTP) {
      user.passwordResetAttempts += 1;
      await user.save({ validateBeforeSave: false });
      const remaining = 5 - user.passwordResetAttempts;
      return next(new AppError(`Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`, 400));
    }

    // OTP is valid — update password and clear all reset fields
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetAttempts = 0;
    await user.save();

    sendTokens(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Redirect to Google OAuth
// @route   GET /api/auth/google
// @access  Public
export const googleRedirect = (req, res) => {
  const role = ['customer', 'worker'].includes(req.query.role) ? req.query.role : 'customer';
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state: role,
    access_type: 'offline',
    prompt: 'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res) => {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  try {
    const { code, state } = req.query;
    if (!code) return res.redirect(`${clientOrigin}/login?error=google_failed`);

    const role = ['customer', 'worker'].includes(state) ? state : 'customer';

    // Exchange code for Google access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) return res.redirect(`${clientOrigin}/login?error=google_failed`);

    // Get user profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();
    if (!googleUser.email) return res.redirect(`${clientOrigin}/login?error=google_failed`);

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId: googleUser.sub }, { email: googleUser.email }] });

    if (user) {
      if (user.is_banned) return res.redirect(`${clientOrigin}/login?error=banned`);
      // Link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleUser.sub;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.sub,
        role,
        profilePhoto: { url: googleUser.picture || '', public_id: '' },
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    res.redirect(`${clientOrigin}/auth/callback?token=${accessToken}`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect(`${clientOrigin}/login?error=google_failed`);
  }
};
