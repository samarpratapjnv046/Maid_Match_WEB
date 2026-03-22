import express from 'express';
import {
  createWorkerProfile,
  updateWorkerProfile,
  uploadProfilePhoto,
  getMyWorkerProfile,
  searchWorkers,
  getWorkerById,
  checkWorkerAvailability,
  submitAadhaar,
  toggleAvailability,
  sendBankOTP,
  submitBankDetails,
} from '../controllers/workerController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import { uploadAadhaar, uploadProfilePhoto as uploadPhoto, uploadPassbook } from '../middleware/upload.js';
import { workerProfileSchema, workerUpdateSchema } from '../validators/workerValidator.js';
import multer from 'multer';

const router = express.Router();

// Public
router.get('/search', searchWorkers);
router.get('/:id/availability', checkWorkerAvailability);
router.get('/:id', getWorkerById);

// Protected
router.get('/profile/me', protect, authorize('worker', 'customer'), getMyWorkerProfile);
router.post(
  '/profile',
  protect,
  authorize('worker', 'customer'),
  uploadAadhaar,
  validate(workerProfileSchema),
  createWorkerProfile
);
router.patch(
  '/profile',
  protect,
  authorize('worker'),
  uploadAadhaar,
  validate(workerUpdateSchema),
  updateWorkerProfile
);
router.post('/profile/photo', protect, authorize('worker'), uploadPhoto, uploadProfilePhoto);
router.patch('/profile/availability', protect, authorize('worker'), toggleAvailability);
router.post('/aadhaar', protect, authorize('worker', 'customer'), uploadAadhaar, submitAadhaar);
router.post('/bank/send-otp', protect, authorize('worker'), sendBankOTP);
router.post('/bank', protect, authorize('worker'), uploadPassbook, submitBankDetails);

export default router;
