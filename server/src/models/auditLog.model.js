import { isIP } from 'node:net';
import mongoose from 'mongoose';
import { AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES, enumValues } from '../constants/enums.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const auditLogSchema = new mongoose.Schema({
  // Optional so that unauthenticated events (e.g. LOGIN_FAILED) can still be recorded.
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: {
    type: String,
    enum: enumValues(AUDIT_ACTIONS),
    required: [true, 'Action is required'],
  },
  resourceType: {
    type: String,
    enum: enumValues(AUDIT_RESOURCE_TYPES),
    required: [true, 'Resource type is required'],
  },
  resourceId: { type: String, trim: true, maxlength: 100 },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({}),
  },
  ipAddress: {
    type: String,
    trim: true,
    validate: {
      validator: (value) => isIP(value) !== 0,
      message: 'ipAddress must be a valid IPv4 or IPv6 address',
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

const rejectMutation = function () {
  throw new Error('Audit logs are append-only and cannot be modified or deleted');
};
auditLogSchema.pre(
  [
    'updateOne',
    'updateMany',
    'findOneAndUpdate',
    'replaceOne',
    'findOneAndReplace',
    'deleteOne',
    'deleteMany',
    'findOneAndDelete',
  ],
  rejectMutation,
);
auditLogSchema.pre('save', function () {
  if (!this.isNew) rejectMutation();
});

auditLogSchema.plugin(toJSONPlugin);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
