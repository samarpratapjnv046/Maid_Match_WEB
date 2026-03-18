import Worker from '../models/Worker.js';
import Transaction from '../models/Transaction.js';
import { AppError } from '../utils/errorHandler.js';

// @desc    Get worker wallet balance
// @route   GET /api/wallet
// @access  Private (worker)
export const getWalletBalance = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user_id: req.user._id }).select('wallet_balance');
    if (!worker) return next(new AppError('Worker profile not found.', 404));
    res.json({ success: true, data: { wallet_balance: worker.wallet_balance } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private (worker)
export const getTransactionHistory = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user_id: req.user._id });
    if (!worker) return next(new AppError('Worker profile not found.', 404));

    const { page, limit, type } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    const skip = (pageNum - 1) * limitNum;

    const filter = { worker_id: worker._id };
    if (type) filter.type = type;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('booking_id', 'service_type start_time end_time'),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};
