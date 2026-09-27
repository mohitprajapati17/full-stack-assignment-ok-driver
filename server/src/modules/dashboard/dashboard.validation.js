import { z } from 'zod';

export const summaryQuerySchema = z.object({
  // Start of the client's "today"; the server's local midnight is used when omitted.
  detectionsSince: z.iso
    .datetime({ offset: true, message: 'Must be an ISO 8601 date-time' })
    .optional(),
});

export const feedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
