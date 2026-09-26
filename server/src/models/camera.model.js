import mongoose from 'mongoose';
import {
  CAMERA_STATUS,
  CAMERA_TYPES,
  SOURCE_PROTOCOLS,
  STORAGE_TYPES,
  enumValues,
} from '../constants/enums.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const URL_WITH_SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:\/\/\S+$/i;

const storageMetadataSchema = new mongoose.Schema(
  {
    storageType: {
      type: String,
      enum: enumValues(STORAGE_TYPES),
      default: STORAGE_TYPES.LOCAL,
    },
    location: { type: String, trim: true, maxlength: 500 },
    retentionDays: { type: Number, min: 1, max: 3650 },
  },
  { _id: false },
);

const cameraSchema = new mongoose.Schema(
  {
    cameraId: {
      type: String,
      required: [true, 'cameraId is required'],
      trim: true,
      uppercase: true,
      maxlength: 64,
      match: [/^[A-Z0-9_-]+$/, 'cameraId may only contain letters, digits, "_" and "-"'],
    },
    name: {
      type: String,
      required: [true, 'Camera name is required'],
      trim: true,
      maxlength: 120,
    },
    department: { type: String, trim: true, maxlength: 120 },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180,
    },
    cameraType: {
      type: String,
      enum: enumValues(CAMERA_TYPES),
      default: CAMERA_TYPES.OTHER,
    },
    sourceProtocol: {
      type: String,
      enum: enumValues(SOURCE_PROTOCOLS),
      required: [true, 'Source protocol is required'],
    },
    streamUrl: {
      type: String,
      required: [true, 'Stream URL is required'],
      trim: true,
      maxlength: 2048,
      match: [URL_WITH_SCHEME_REGEX, 'Stream URL must be a valid URL, e.g. rtsp://host/path'],
    },
    status: {
      type: String,
      enum: enumValues(CAMERA_STATUS),
      default: CAMERA_STATUS.OFFLINE,
    },
    lastHeartbeat: { type: Date },
    zone: { type: String, trim: true, maxlength: 120 },
    storageMetadata: { type: storageMetadataSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

cameraSchema.index({ cameraId: 1 }, { unique: true });
cameraSchema.index({ status: 1, lastHeartbeat: 1 });
cameraSchema.index({ department: 1, zone: 1 });

cameraSchema.plugin(toJSONPlugin);

export const Camera = mongoose.model('Camera', cameraSchema);
