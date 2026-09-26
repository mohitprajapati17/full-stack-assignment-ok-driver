import mongoose from 'mongoose';
import { WATCHLIST_ENTITY_TYPES, WATCHLIST_REASONS, enumValues } from '../constants/enums.js';
import { normalizeVehicleNumber } from '../utils/normalize.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const watchlistSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: enumValues(WATCHLIST_ENTITY_TYPES),
      default: WATCHLIST_ENTITY_TYPES.VEHICLE,
      required: true,
    },
    identifier: {
      type: String,
      required: [true, 'Identifier is required'],
      trim: true,
      maxlength: 100,
    },
    reason: {
      type: String,
      enum: enumValues(WATCHLIST_REASONS),
      required: [true, 'Reason is required'],
    },
    description: { type: String, trim: true, maxlength: 1000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

watchlistSchema.pre('validate', function () {
  if (this.entityType === WATCHLIST_ENTITY_TYPES.VEHICLE) {
    this.identifier = normalizeVehicleNumber(this.identifier);
  }
});

watchlistSchema.index({ identifier: 1 });
watchlistSchema.index(
  { entityType: 1, identifier: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

watchlistSchema.plugin(toJSONPlugin);

export const Watchlist = mongoose.model('Watchlist', watchlistSchema);
