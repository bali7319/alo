/**
 * Career API Validation Schemas
 * Zod ile input validation
 */

import { z } from 'zod';

/**
 * Kariyer başvurusu validation schema
 */
export const createCareerApplicationSchema = z.object({
  fullName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır').max(100, 'Ad Soyad en fazla 100 karakter olabilir'),
  email: z.string().email('Geçerli bir email adresi giriniz').max(255, 'Email en fazla 255 karakter olabilir'),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Geçerli bir telefon numarası giriniz').min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
  position: z.string().min(1, 'Pozisyon seçilmelidir').max(100, 'Pozisyon en fazla 100 karakter olabilir'),
  experience: z.string().max(2000, 'Deneyim en fazla 2000 karakter olabilir').optional().nullable(),
  education: z.string().max(2000, 'Eğitim en fazla 2000 karakter olabilir').optional().nullable(),
  coverLetter: z.string().min(10, 'Ön yazı en az 10 karakter olmalıdır').max(5000, 'Ön yazı en fazla 5000 karakter olabilir'),
  resume: z.string().optional().nullable(),
});

export type CreateCareerApplicationInput = z.infer<typeof createCareerApplicationSchema>;

