import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/errorHandler.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authenticated. Please log in.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (user.is_banned) {
      return next(new AppError('Your account has been suspended. Contact support.', 403));
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Password was recently changed. Please log in again.', 401));
    }

    req.user = user;
    // Use the role from the JWT (active mode), not the DB field.
    // This is what makes worker ↔ customer mode switching work correctly.
    req.user.role = decoded.role;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please refresh your session.', 401));
    }
    next(err);
  }
};
