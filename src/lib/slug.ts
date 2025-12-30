/**
 * İlan başlığından SEO-friendly slug oluşturur
 * Örnek: "iPhone 14 Pro Max" -> "iphone-14-pro-max"
 */
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Türkçe karakterleri değiştir
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    // Özel karakterleri kaldır veya değiştir
    .replace(/[^a-z0-9\s-]/g, '')
    // Birden fazla boşluğu tek boşluğa çevir
    .replace(/\s+/g, ' ')
    // Boşlukları tire ile değiştir
    .replace(/\s/g, '-')
    // Birden fazla tireyi tek tireye çevir
    .replace(/-+/g, '-')
    // Başta ve sonda tire varsa kaldır
    .replace(/^-+|-+$/g, '');
}

/**
 * Slug'dan ilan ID'sini çıkarır (geriye dönük uyumluluk için)
 * Artık slug formatında URL kullanıyoruz: "/ilan/kiralik-mobil-jenerator"
 * Eski ID formatı desteği: "/ilan/cmjkhx5h60001bf7lsliv4tvy"
 */
export function extractIdFromSlug(slug: string): string | null {
  // Eski format: sadece ID (20+ karakter alfanumerik) - geriye dönük uyumluluk
  if (slug.length >= 20 && /^[a-z0-9]+$/i.test(slug)) {
    return slug;
  }
  // Yeni format: slug - null döndür, API route slug'dan arama yapacak
  return null;
}

