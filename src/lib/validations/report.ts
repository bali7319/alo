/**
 * Report API Validation Schemas
 * Zod ile input validation
 */

import { z } from 'zod';

/**
 * Şikayet oluşturma validation schema
 */
export const createReportSchema = z.object({
  listingId: z.string().min(1, 'İlan ID gereklidir'),
  reason: z.enum(['spam', 'inappropriate', 'fake', 'duplicate', 'other'], {
    message: 'Geçerli bir şikayet nedeni seçiniz',
  }),
  description: z.string().max(1000, 'Açıklama en fazla 1000 karakter olabilir').optional().nullable(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

