import { env } from '../config/env.js';

// Express identifies error handlers by their 4-argument signature, so `_next` must stay.
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode ?? 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message: statusCode >= 500 && env.isProduction ? 'Internal server error' : err.message,
      ...(err.details && { details: err.details }),
      ...(!env.isProduction && statusCode >= 500 && { stack: err.stack }),
    },
  });
}
