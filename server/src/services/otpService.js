import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import OTP from '../models/OTP.js';
import { AppError } from '../utils/errorHandler.js';

const OTP_EXPIRY_MINUTES = 30;
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

/**
 * Generates a cryptographically secure 6-digit OTP, hashes it, and stores in DB.
 * Returns the plaintext OTP to be sent to the user.
 */
export const generateAndStoreOTP = async (bookingId) => {
  // Delete any existing OTP for this booking
  await OTP.findOneAndDelete({ booking_id: bookingId });

  const otp = crypto.randomInt(100000, 999999).toString();
  const salt = await bcrypt.genSalt(10);
  const otp_hash = await bcrypt.hash(otp, salt);

  const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await OTP.create({ booking_id: bookingId, otp_hash, expires_at });

  return otp; // Return plaintext once — never stored
};

/**
 * Verifies a submitted OTP against the stored hash.
 * Implements brute-force protection and OTP expiry.
 */
export const verifyOTP = async (bookingId, submittedOtp) => {
  const otpRecord = await OTP.findOne({ booking_id: bookingId });

  if (!otpRecord) {
    throw new AppError('OTP not found or already used. Please request a new one.', 404);
  }

  // Check lock
  if (otpRecord.locked_until && otpRecord.locked_until > new Date()) {
    const remainingMs = otpRecord.locked_until - new Date();
    const remainingMin = Math.ceil(remainingMs / 60000);
    throw new AppError(
      `Too many failed attempts. OTP locked for ${remainingMin} more minute(s).`,
      429
    );
  }

  // Check expiry
  if (otpRecord.expires_at < new Date()) {
    await OTP.findByIdAndDelete(otpRecord._id);
    throw new AppError('OTP has expired. Please request a new one.', 410);
  }

  // Check already used
  if (otpRecord.is_used) {
    throw new AppError('OTP has already been used.', 409);
  }

  // Verify
  const isValid = await bcrypt.compare(submittedOtp, otpRecord.otp_hash);

  if (!isValid) {
    otpRecord.attempts += 1;
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      otpRecord.locked_until = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
    }
    await otpRecord.save();
    const remaining = MAX_ATTEMPTS - otpRecord.attempts;
    throw new AppError(
      remaining > 0
        ? `Invalid OTP. ${remaining} attempt(s) remaining.`
        : `OTP locked for ${LOCK_DURATION_MINUTES} minutes due to too many failed attempts.`,
      400
    );
  }

  // Mark as used
  otpRecord.is_used = true;
  await otpRecord.save();

  return true;
};
