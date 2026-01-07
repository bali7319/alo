/**
 * Contract API Validation Schemas
 * Zod ile input validation
 */

import { z } from 'zod';

/**
 * Sözleşme oluşturma validation schema
 */
export const createContractSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').max(200, 'Başlık en fazla 200 karakter olabilir'),
  type: z.string().min(1, 'Tip gereklidir').max(50, 'Tip en fazla 50 karakter olabilir'),
  content: z.string().min(1, 'İçerik gereklidir'),
  version: z.string().min(1, 'Versiyon gereklidir').max(20, 'Versiyon en fazla 20 karakter olabilir'),
  isActive: z.boolean().optional().default(true),
  isRequired: z.boolean().optional().default(false),
  language: z.string().min(2, 'Dil kodu en az 2 karakter olmalıdır').max(5, 'Dil kodu en fazla 5 karakter olabilir').default('tr'),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;

/**
 * Sözleşme güncelleme validation schema
 */
export const updateContractSchema = createContractSchema.partial().extend({
  id: z.string().min(1, 'Sözleşme ID gereklidir'),
});

export type UpdateContractInput = z.infer<typeof updateContractSchema>;

