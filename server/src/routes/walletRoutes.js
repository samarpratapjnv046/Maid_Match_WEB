import express from 'express';
import { getWalletBalance, getTransactionHistory, requestWithdrawal, getWithdrawals } from '../controllers/walletController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect, authorize('worker'));

router.get('/', getWalletBalance);
router.get('/transactions', getTransactionHistory);
router.post('/withdraw', requestWithdrawal);
router.get('/withdrawals', getWithdrawals);

export default router;
