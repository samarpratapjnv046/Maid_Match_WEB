import express from 'express';
import {
  getAllUsers,
  banUser,
  unbanUser,
  getAllWorkers,
  getWorkerDetail,
  verifyWorker,
  rejectWorker,
  getAllBookings,
  getAllPayments,
  getRevenueStats,
  getAllReviews,
  hideReview,
  getAuditLogs,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalProcessing,
  getRefundRequests,
  processManualRefund,
} from '../controllers/adminController.js';
import {
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOffer,
} from '../controllers/offerController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { processRefund } from '../controllers/paymentController.js';

const router = express.Router();

router.use(protect, authorize('admin')); // All admin routes protected

// Users
router.get('/users', getAllUsers);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);

// Workers
router.get('/workers', getAllWorkers);
router.get('/workers/:id', getWorkerDetail);
router.patch('/workers/:id/verify', verifyWorker);
router.patch('/workers/:id/reject', rejectWorker);

// Bookings
router.get('/bookings', getAllBookings);

// Payments & Revenue
router.get('/payments', getAllPayments);
router.get('/revenue', getRevenueStats);
router.post('/payments/:bookingId/refund', processRefund);

// Reviews
router.get('/reviews', getAllReviews);
router.patch('/reviews/:id/hide', hideReview);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

// Refund requests (cancelled paid bookings awaiting manual bank transfer)
router.get('/refund-requests', getRefundRequests);
router.patch('/refund-requests/:bookingId/process', processManualRefund);

// Withdrawals
router.get('/withdrawals', getAllWithdrawals);
router.patch('/withdrawals/:id/approve', approveWithdrawal);
router.patch('/withdrawals/:id/reject', rejectWithdrawal);
router.patch('/withdrawals/:id/processing', markWithdrawalProcessing);

// Offers (home page promotions)
router.get('/offers', getAllOffers);
router.post('/offers', createOffer);
router.patch('/offers/:id', updateOffer);
router.patch('/offers/:id/toggle', toggleOffer);
router.delete('/offers/:id', deleteOffer);


export default router;
