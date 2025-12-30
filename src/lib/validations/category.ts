/**
 * Category API Validation Schemas
 * Zod ile input validation
 */

import { z } from 'zod';

/**
 * Category route query parameters validation
 */
export const categoryQuerySchema = z.object({
  slug: z.string().min(1).max(100),
  subSlug: z.string().max(100).optional().nullable(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CategoryQueryParams = z.infer<typeof categoryQuerySchema>;

