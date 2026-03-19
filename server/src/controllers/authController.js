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
    const { name, email, password, phone, role, pincode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered.', 409));
    }

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
