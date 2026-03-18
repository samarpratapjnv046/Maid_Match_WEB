import express from 'express';
import { getWalletBalance, getTransactionHistory } from '../controllers/walletController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect, authorize('worker'));

router.get('/', getWalletBalance);
router.get('/transactions', getTransactionHistory);

export default router;
