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
  submitBankDetails,
} from '../controllers/workerController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import { uploadAadhaar, uploadProfilePhoto as uploadPhoto, uploadPassbook } from '../middleware/upload.js';
import { workerProfileSchema, workerUpdateSchema } from '../validators/workerValidator.js';

const router = express.Router();

// Public
router.get('/search', searchWorkers);
router.get('/:id/availability', checkWorkerAvailability);
router.get('/:id', getWorkerById);

// Protected — allow both 'worker' and 'customer' roles so profile setup
// works regardless of the user's currently active mode
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
  authorize('worker', 'customer'),
  uploadAadhaar,
  validate(workerUpdateSchema),
  updateWorkerProfile
);
router.post('/profile/photo', protect, authorize('worker', 'customer'), uploadPhoto, uploadProfilePhoto);
router.patch('/profile/availability', protect, authorize('worker'), toggleAvailability);
router.post('/aadhaar', protect, authorize('worker', 'customer'), uploadAadhaar, submitAadhaar);
router.post('/bank', protect, authorize('worker', 'customer'), uploadPassbook, submitBankDetails);

export default router;
