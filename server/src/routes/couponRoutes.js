import express from 'express';
import { applyCoupon } from '../controllers/couponController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Customer: validate and preview a coupon discount
// POST /api/coupons/apply
router.post('/apply', protect, applyCoupon);

export default router;
