import express from 'express';
import {
  createBooking,
  respondToBooking,
  getMyBookings,
  getBookingById,
  completeBookingWithOTP,
  cancelBooking,
  deleteBooking,
  submitReview,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import { otpLimiter } from '../middleware/rateLimiter.js';
import {
  createBookingSchema,
  bookingActionSchema,
  otpVerifySchema,
  reviewSchema,
} from '../validators/bookingValidator.js';

const router = express.Router();

router.use(protect); // All booking routes require auth

router.post('/', authorize('customer'), validate(createBookingSchema), createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/respond', authorize('worker'), validate(bookingActionSchema), respondToBooking);
router.patch('/:id/cancel', authorize('customer'), cancelBooking);
router.post('/:id/complete', authorize('worker'), otpLimiter, validate(otpVerifySchema), completeBookingWithOTP);
router.post('/:id/review', authorize('customer'), validate(reviewSchema), submitReview);
router.delete('/:id', deleteBooking);

export default router;
