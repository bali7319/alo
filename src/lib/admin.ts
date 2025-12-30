/**
 * Admin Utility Functions
 * Admin kullanıcı ile ilgili merkezi fonksiyonlar
 */

/**
 * Admin email adresini döndürür
 * Environment variable'dan alır, yoksa default değer kullanır
 */
export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || 'admin@alo17.tr';
}

/**
 * Verilen email'in admin email'i olup olmadığını kontrol eder
 */
export function isAdminEmail(email: string): boolean {
  return email === getAdminEmail();
}

