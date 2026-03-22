import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema(
  {
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [100, 'Minimum withdrawal amount is ₹100'],
    },
    // Snapshot of bank details at time of request (in case worker updates them later)
    bank_snapshot: {
      account_holder_name: { type: String, default: '' },
      account_number: { type: String, default: '' },
      ifsc_code: { type: String, default: '' },
      bank_name: { type: String, default: '' },
    },
    balance_before: { type: Number, required: true },
    balance_after: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected'],
      default: 'pending',
    },
    utr_number: { type: String, default: '' },   // UTR/reference from admin after transfer
    rejection_reason: { type: String, default: '' },
    admin_notes: { type: String, default: '' },
    processed_at: { type: Date },
  },
  { timestamps: true }
);

withdrawalRequestSchema.index({ worker_id: 1, createdAt: -1 });
withdrawalRequestSchema.index({ status: 1, createdAt: -1 });

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
export default WithdrawalRequest;
