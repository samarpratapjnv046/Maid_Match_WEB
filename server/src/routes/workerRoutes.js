import express from 'express';
import {
  createWorkerProfile,
  updateWorkerProfile,
  uploadProfilePhoto,
  getMyWorkerProfile,
  searchWorkers,
  getWorkerById,
} from '../controllers/workerController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import { uploadAadhaar, uploadProfilePhoto as uploadPhoto } from '../middleware/upload.js';
import { workerProfileSchema, workerUpdateSchema } from '../validators/workerValidator.js';
import multer from 'multer';

const router = express.Router();

// Public
router.get('/search', searchWorkers);
router.get('/:id', getWorkerById);

// Protected (worker only)
router.get('/profile/me', protect, authorize('worker'), getMyWorkerProfile);
router.post(
  '/profile',
  protect,
  authorize('worker'),
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

export default router;
