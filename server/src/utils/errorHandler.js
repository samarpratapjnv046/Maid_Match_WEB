import logger from './logger.js';

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists. Please use a different value.`, 409);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join(', ')}`, 422);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpired = () =>
  new AppError('Token expired. Please log in again.', 401);

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log unexpected errors
  if (!err.isOperational) {
    logger.error('UNEXPECTED ERROR:', { message: err.message, stack: err.stack });
  }

  let error = { ...err, message: err.message };

  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpired();

  // Production: hide stack trace & internal errors
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
