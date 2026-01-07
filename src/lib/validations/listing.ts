/**
 * Listing API Validation Schemas
 * Zod ile input validation
 */

import { z } from 'zod';

/**
 * Listing oluşturma validation schema
 */
export const createListingSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır').max(200, 'Başlık en fazla 200 karakter olabilir'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır').max(5000, 'Açıklama en fazla 5000 karakter olabilir'),
  price: z.union([
    z.number().positive('Fiyat pozitif bir sayı olmalıdır'),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) throw new Error('Geçerli bir fiyat giriniz');
      return num;
    }),
  ]),
  category: z.string().min(1, 'Kategori seçilmelidir'),
  subCategory: z.string().optional().nullable(),
  subSubCategory: z.string().optional().nullable(),
  location: z.string().min(1, 'Konum belirtilmelidir'),
  phone: z.string().optional().nullable(),
  showPhone: z.boolean().optional().default(true),
  images: z.array(z.string().url('Geçerli bir resim URL\'si giriniz')).min(1, 'En az bir resim yüklemelisiniz').max(10, 'En fazla 10 resim yükleyebilirsiniz'),
  features: z.array(z.string()).optional().default([]),
  condition: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  isPremium: z.boolean().optional().default(false),
  premiumFeatures: z.record(z.string(), z.any()).optional().nullable(),
  premiumUntil: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

/**
 * Listing güncelleme validation schema
 */
export const updateListingSchema = createListingSchema.partial().extend({
  id: z.string().min(1, 'İlan ID gereklidir'),
});

export type UpdateListingInput = z.infer<typeof updateListingSchema>;

/**
 * Listing approval status güncelleme schema
 */
export const updateListingStatusSchema = z.object({
  approvalStatus: z.enum(['pending', 'approved', 'rejected'], {
    message: 'Geçerli bir onay durumu seçiniz (pending, approved, rejected)',
  }),
});

export type UpdateListingStatusInput = z.infer<typeof updateListingStatusSchema>;

