import { ApiRequestError } from './apiClient';

/**
 * Converts an API error into `{ fieldErrors, formError }` so forms can show
 * server-side validation (400) and uniqueness (409) errors next to the right field.
 */
export function mapApiErrorToForm(error) {
  if (!(error instanceof ApiRequestError)) {
    return { fieldErrors: {}, formError: error?.message ?? 'Something went wrong' };
  }

  const fieldErrors = {};
  const { details } = error;

  if (Array.isArray(details)) {
    for (const { path, message } of details) {
      if (path && !fieldErrors[path]) fieldErrors[path] = message;
    }
  } else if (error.status === 409 && Array.isArray(details?.fields)) {
    for (const field of details.fields) fieldErrors[field] = 'This value is already in use';
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  return { fieldErrors, formError: hasFieldErrors ? null : error.message };
}
