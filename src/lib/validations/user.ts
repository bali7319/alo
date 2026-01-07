/**
 * User API Validation Schemas
 * Zod ile input validation
 */

import { z } from 'zod';

/**
 * Kullanıcı kayıt validation schema
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır').max(100, 'Ad en fazla 100 karakter olabilir'),
  email: z.string().email('Geçerli bir email adresi giriniz').max(255, 'Email en fazla 255 karakter olabilir'),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Geçerli bir telefon numarası giriniz').optional().nullable(),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır').max(100, 'Şifre en fazla 100 karakter olabilir'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Kullanıcı profil güncelleme schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır').max(100, 'Ad en fazla 100 karakter olabilir').optional(),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Geçerli bir telefon numarası giriniz').optional().nullable(),
  location: z.string().max(255, 'Konum en fazla 255 karakter olabilir').optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Şifre değiştirme schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gereklidir'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır').max(100, 'Yeni şifre en fazla 100 karakter olabilir'),
  confirmPassword: z.string().min(1, 'Şifre onayı gereklidir'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Yeni şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

