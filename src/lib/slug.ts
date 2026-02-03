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
 * İlan detay sayfası için canonical path segment üretir.
 * Örn: "/ilan/iphone-14-pro-max-cmjk...".
 */
export function createListingSlug(title: string, id: string): string {
  const slug = createSlug(title);
  return `${slug}-${id}`;
}

/**
 * Slug'dan ilan ID'sini çıkarır (geriye dönük uyumluluk için)
 * Desteklenen formatlar:
 * - "/ilan/<id>" (salt ID)
 * - "/ilan/<slug>-<id>" (canonical)
 * - "/ilan/<slug>" (eski; ID çıkarılamaz)
 */
export function extractIdFromSlug(slug: string): string | null {
  const s = (slug || '').trim();
  if (!s) return null;

  // Prisma cuid() genelde "c" ile başlar ve yalnızca [a-z0-9] içerir.
  const looksLikeCuid = (v: string) => /^c[a-z0-9]{19,}$/i.test(v);

  // 1) Salt ID
  if (looksLikeCuid(s)) return s;

  // 2) slug-id: son parçayı ID olarak kabul et
  const last = s.includes('-') ? s.split('-').pop() : null;
  if (last && looksLikeCuid(last)) return last;

  // 3) slug-only: ID çıkarılamaz
  return null;
}

