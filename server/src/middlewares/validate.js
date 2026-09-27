import { ApiError } from '../utils/ApiError.js';

/**
 * Validates `req.body`, `req.query` and/or `req.params` against Zod schemas.
 * Parsed (coerced, defaulted, stripped) values are exposed on `req.validated`
 * because Express 5 makes `req.query` read-only.
 */
export const validate = (schemas) => (req, _res, next) => {
  const validated = {};

  for (const [source, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(400, 'Validation failed', details));
    }
    validated[source] = result.data;
  }

  req.validated = validated;
  next();
};
