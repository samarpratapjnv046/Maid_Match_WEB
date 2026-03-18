import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit', 'refund_debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balance_after: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

transactionSchema.index({ worker_id: 1, createdAt: -1 });
transactionSchema.index({ booking_id: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
