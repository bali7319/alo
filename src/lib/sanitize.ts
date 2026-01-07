/**
 * Input Sanitization Utility
 * XSS ve injection saldırılarına karşı koruma
 */

/**
 * HTML etiketlerini temizler (XSS koruması)
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * SQL injection karakterlerini temizler
 */
export function sanitizeSql(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

/**
 * Genel input temizleme (HTML ve SQL)
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  let sanitized = sanitizeHtml(input);
  sanitized = sanitizeSql(sanitized);
  
  // Fazla boşlukları temizle
  sanitized = sanitized.trim().replace(/\s+/g, ' ');
  
  return sanitized;
}

/**
 * URL'leri temizler
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    // Sadece http ve https protokollerine izin ver
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Email formatını kontrol eder ve temizler
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.trim().toLowerCase();
  
  if (!emailRegex.test(cleaned)) {
    return '';
  }
  
  return cleaned;
}

/**
 * Telefon numarasını temizler (sadece rakamlar ve +)
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  return phone.replace(/[^\d+]/g, '');
}

