import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

function toApiError(err) {
  if (err instanceof ApiError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map(({ path, message }) => ({ path, message }));
    return new ApiError(400, 'Validation failed', details);
  }
  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(400, `Invalid value for ${err.path}`);
  }
  if (err?.code === 11000) {
    const fields = Object.keys(err.keyValue ?? err.keyPattern ?? {});
    return new ApiError(409, `A record with this ${fields.join(', ') || 'value'} already exists`, {
      fields,
    });
  }
  // Errors raised by express.json() (malformed JSON, payload too large) carry an HTTP status.
  if (err?.type && Number.isInteger(err.status) && err.status < 500) {
    return new ApiError(err.status, err.message);
  }

  const internal = new ApiError(500, err?.message ?? 'Internal server error');
  internal.stack = err?.stack;
  return internal;
}

// Express identifies error handlers by their 4-argument signature, so `_next` must stay.
export function errorHandler(err, req, res, _next) {
  const apiError = toApiError(err);
  const { statusCode } = apiError;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message: statusCode >= 500 && env.isProduction ? 'Internal server error' : apiError.message,
      ...(apiError.details && { details: apiError.details }),
      ...(!env.isProduction && statusCode >= 500 && { stack: apiError.stack }),
    },
  });
}
