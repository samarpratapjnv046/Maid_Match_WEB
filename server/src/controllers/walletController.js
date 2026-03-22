import Worker from '../models/Worker.js';
import Transaction from '../models/Transaction.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
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

// @desc    Request a wallet withdrawal to bank account
// @route   POST /api/wallet/withdraw
// @access  Private (worker)
export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount < 100) {
      return next(new AppError('Minimum withdrawal amount is ₹100.', 400));
    }

    const worker = await Worker.findOne({ user_id: req.user._id });
    if (!worker) return next(new AppError('Worker profile not found.', 404));

    // Must have verified bank details
    if (!worker.bank_details?.is_verified) {
      return next(new AppError('Please add and verify your bank account before requesting a withdrawal.', 400));
    }

    if (worker.wallet_balance < parsedAmount) {
      return next(new AppError(`Insufficient balance. Available: ₹${worker.wallet_balance.toFixed(2)}.`, 400));
    }

    // Check no pending withdrawal already exists
    const existingPending = await WithdrawalRequest.findOne({
      worker_id: worker._id,
      status: { $in: ['pending', 'processing'] },
    });
    if (existingPending) {
      return next(new AppError('You already have a withdrawal request in progress. Please wait for it to be processed.', 409));
    }

    const balanceBefore = worker.wallet_balance;
    const balanceAfter  = balanceBefore - parsedAmount; // projected; actual deduction on admin approval

    const withdrawal = await WithdrawalRequest.create({
      worker_id: worker._id,
      amount: parsedAmount,
      bank_snapshot: {
        account_holder_name: worker.bank_details.account_holder_name,
        account_number:      worker.bank_details.account_number,
        ifsc_code:           worker.bank_details.ifsc_code,
        bank_name:           worker.bank_details.bank_name,
      },
      balance_before: balanceBefore,
      balance_after:  balanceAfter,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted. Funds will be deducted and transferred after admin approval.',
      data: withdrawal,
      new_balance: balanceBefore, // balance unchanged until approved
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get withdrawal request history for the worker
// @route   GET /api/wallet/withdrawals
// @access  Private (worker)
export const getWithdrawals = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user_id: req.user._id }).select('_id');
    if (!worker) return next(new AppError('Worker profile not found.', 404));

    const withdrawals = await WithdrawalRequest.find({ worker_id: worker._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: withdrawals });
  } catch (err) {
    next(err);
  }
};
