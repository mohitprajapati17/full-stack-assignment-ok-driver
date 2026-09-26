import mongoose from 'mongoose';
import { ALERT_SEVERITY, ALERT_STATUS, enumValues } from '../constants/enums.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { ObjectId } = mongoose.Schema.Types;

const alertSchema = new mongoose.Schema(
  {
    detectionEventId: {
      type: ObjectId,
      ref: 'DetectionEvent',
      required: [true, 'detectionEventId is required'],
    },
    cameraId: {
      type: String,
      required: [true, 'cameraId is required'],
      trim: true,
      uppercase: true,
      maxlength: 64,
    },
    matchedEntity: {
      type: ObjectId,
      ref: 'Watchlist',
      required: [true, 'matchedEntity is required'],
    },
    identifier: {
      type: String,
      required: [true, 'Identifier is required'],
      trim: true,
      maxlength: 100,
    },
    confidence: {
      type: Number,
      required: [true, 'Confidence is required'],
      min: 0,
      max: 1,
    },
    severity: {
      type: String,
      enum: enumValues(ALERT_SEVERITY),
      default: ALERT_SEVERITY.MEDIUM,
      required: true,
    },
    status: {
      type: String,
      enum: enumValues(ALERT_STATUS),
      default: ALERT_STATUS.NEW,
      required: true,
    },
    timestamp: {
      type: Date,
      required: [true, 'Alert timestamp is required'],
    },
    acknowledgedBy: { type: ObjectId, ref: 'User' },
    acknowledgedAt: { type: Date },
    resolvedBy: { type: ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Runs on save()/validate() only, so status transitions should go through documents
// rather than findOneAndUpdate().
alertSchema.pre('validate', function () {
  const requireFields = (fields) => {
    for (const field of fields) {
      if (!this[field])
        this.invalidate(field, `${field} is required when status is ${this.status}`);
    }
  };

  if (this.status === ALERT_STATUS.ACKNOWLEDGED) {
    requireFields(['acknowledgedBy', 'acknowledgedAt']);
  }
  if (this.status === ALERT_STATUS.RESOLVED) {
    requireFields(['resolvedBy', 'resolvedAt']);
  }
});

alertSchema.index({ status: 1, timestamp: -1 });
alertSchema.index({ timestamp: -1 });
alertSchema.index({ cameraId: 1, timestamp: -1 });
alertSchema.index({ detectionEventId: 1, matchedEntity: 1 }, { unique: true });

alertSchema.plugin(toJSONPlugin);

export const Alert = mongoose.model('Alert', alertSchema);
