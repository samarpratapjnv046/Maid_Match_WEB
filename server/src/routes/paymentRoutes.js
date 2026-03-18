import express from 'express';
import {
  createOrder,
  verifyPayment,
  processRefund,
  razorpayWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';
import { createOrderSchema, verifyPaymentSchema } from '../validators/paymentValidator.js';

const router = express.Router();

// Webhook must come before body parsing middleware (uses raw body in app.js)
router.post('/webhook', razorpayWebhook);

router.use(protect);

router.post('/create-order', paymentLimiter, authorize('customer'), validate(createOrderSchema), createOrder);
router.post('/verify', paymentLimiter, authorize('customer'), validate(verifyPaymentSchema), verifyPayment);
router.post('/:bookingId/refund', authorize('admin'), processRefund);

export default router;
