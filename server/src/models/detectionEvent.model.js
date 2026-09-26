import mongoose from 'mongoose';
import { DETECTION_EVENT_TYPES, VEHICLE_TYPES, enumValues } from '../constants/enums.js';
import { normalizeVehicleNumber } from '../utils/normalize.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const unitInterval = { type: Number, required: true, min: 0, max: 1 };

// Coordinates are normalized to the frame size (0–1) so they are resolution-independent.
const boundingBoxSchema = new mongoose.Schema(
  {
    x: unitInterval,
    y: unitInterval,
    width: unitInterval,
    height: unitInterval,
  },
  { _id: false },
);

boundingBoxSchema.pre('validate', function () {
  if (this.x + this.width > 1) this.invalidate('width', 'x + width must not exceed 1');
  if (this.y + this.height > 1) this.invalidate('height', 'y + height must not exceed 1');
});

const detectionEventSchema = new mongoose.Schema(
  {
    cameraId: {
      type: String,
      required: [true, 'cameraId is required'],
      trim: true,
      uppercase: true,
      maxlength: 64,
    },
    timestamp: {
      type: Date,
      required: [true, 'Detection timestamp is required'],
    },
    vehicleNumber: {
      type: String,
      set: normalizeVehicleNumber,
      maxlength: 20,
      required: [
        function () {
          return this.eventType === DETECTION_EVENT_TYPES.PLATE_RECOGNITION;
        },
        'vehicleNumber is required for PLATE_RECOGNITION events',
      ],
    },
    confidence: {
      type: Number,
      required: [true, 'Confidence is required'],
      min: 0,
      max: 1,
    },
    vehicleType: {
      type: String,
      enum: enumValues(VEHICLE_TYPES),
      default: VEHICLE_TYPES.UNKNOWN,
    },
    boundingBox: { type: boundingBoxSchema },
    eventType: {
      type: String,
      enum: enumValues(DETECTION_EVENT_TYPES),
      default: DETECTION_EVENT_TYPES.VEHICLE_DETECTION,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

detectionEventSchema.index({ cameraId: 1, timestamp: -1 });
detectionEventSchema.index({ vehicleNumber: 1, timestamp: -1 });
detectionEventSchema.index({ timestamp: -1 });

detectionEventSchema.virtual('camera', {
  ref: 'Camera',
  localField: 'cameraId',
  foreignField: 'cameraId',
  justOne: true,
});

detectionEventSchema.plugin(toJSONPlugin);

export const DetectionEvent = mongoose.model('DetectionEvent', detectionEventSchema);
