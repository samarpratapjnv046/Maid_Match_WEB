import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateMe,
  changePassword,
  googleRedirect,
  googleCallback,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadProfilePhoto } from '../middleware/upload.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);

router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);

router.get('/me', protect, getMe);
router.patch('/me', protect, uploadProfilePhoto, updateMe);
router.patch('/change-password', protect, validate(changePasswordSchema), changePassword);

export default router;
