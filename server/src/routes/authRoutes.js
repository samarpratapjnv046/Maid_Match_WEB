import express from 'express';
import {
  register,
  sendRegisterOTP,
  login,
  refreshToken,
  logout,
  getMe,
  updateMe,
  changePassword,
  switchMode,
  forgotPassword,
  resetPassword,
  googleRedirect,
  googleCallback,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadProfilePhoto } from '../middleware/upload.js';
import { authLimiter, forgotPasswordLimiter, otpLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/send-register-otp', forgotPasswordLimiter, sendRegisterOTP);
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', otpLimiter, resetPassword);

router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);

router.get('/me', protect, getMe);
router.patch('/me', protect, uploadProfilePhoto, updateMe);
router.patch('/change-password', protect, validate(changePasswordSchema), changePassword);
router.post('/switch-mode', protect, switchMode);

export default router;
