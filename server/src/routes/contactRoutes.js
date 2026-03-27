import express from 'express';
import {
  submitContactMessage,
  getContactMessages,
  markAsRead,
  deleteContactMessage,
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

// Public — anyone can submit a contact message
router.post('/', submitContactMessage);

// Admin only
router.use(protect, authorize('admin'));
router.get('/',           getContactMessages);
router.patch('/:id/read', markAsRead);
router.delete('/:id',     deleteContactMessage);

export default router;
