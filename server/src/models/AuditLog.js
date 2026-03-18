import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      // e.g. 'VERIFY_WORKER', 'REJECT_WORKER', 'BAN_USER', 'UNBAN_USER', 'REFUND_ISSUED'
    },
    entity_type: {
      type: String,
      enum: ['user', 'worker', 'booking', 'payment', 'review'],
      required: true,
    },
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    before_state: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    after_state: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    note: {
      type: String,
      default: '',
    },
    ip_address: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ admin_id: 1, createdAt: -1 });
auditLogSchema.index({ entity_type: 1, entity_id: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
