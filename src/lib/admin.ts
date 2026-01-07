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
 * Hem environment variable'dan gelen email'i hem de genel admin pattern'lerini kontrol eder
 */
export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  
  // Önce environment variable'dan gelen email'i kontrol et
  if (email === getAdminEmail()) {
    return true;
  }
  
  // Genel admin email pattern'leri (backward compatibility)
  return email === 'admin@alo17.tr' ||
         email === 'admin@alo17.com' ||
         email === 'destek@alo17.tr' ||
         email === 'destek@alo17.com' ||
         email.endsWith('@alo17.com') ||
         email.endsWith('@alo17.tr');
}

