import express from 'express';
import { getMessages, sendMessage, markBookingRead, getUnreadCounts } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/unread', getUnreadCounts);           // must be before /:bookingId
router.get('/:bookingId', getMessages);
router.post('/:bookingId', sendMessage);
router.post('/:bookingId/read', markBookingRead);

export default router;
