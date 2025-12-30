/**
 * Merkezi Kategori Mapping Sistemi
 * 
 * Bu dosya tüm kategori slug'larını kategori adlarına çeviren
 * merkezi bir mapping sağlar. DRY prensibine uygun olarak
 * tek bir kaynaktan yönetilir.
 */

import { categories } from './categories';

/**
 * Kategori slug'ını kategori adına çevirir
 * @param slug - Kategori slug'ı (örn: "elektronik")
 * @returns Kategori adı (örn: "Elektronik") veya undefined
 */
export function getCategoryNameBySlug(slug: string): string | undefined {
  const category = categories.find(cat => cat.slug === slug);
  return category?.name;
}

/**
 * Alt kategori slug'ını alt kategori adına çevirir
 * @param subSlug - Alt kategori slug'ı (örn: "bilgisayar")
 * @returns Alt kategori adı (örn: "Bilgisayar") veya undefined
 */
export function getSubCategoryNameBySlug(subSlug: string): string | undefined {
  for (const category of categories) {
    const subCategory = category.subcategories?.find(
      sub => sub.slug === subSlug
    );
    if (subCategory) {
      return subCategory.name;
    }
  }
  return undefined;
}

/**
 * Tüm kategori slug'larını kategori adlarına çeviren map
 * Performans için önceden hesaplanmış map
 */
export const categoryMap: Record<string, string> = Object.fromEntries(
  categories.map(cat => [cat.slug, cat.name])
);

/**
 * Tüm alt kategori slug'larını alt kategori adlarına çeviren map
 * Performans için önceden hesaplanmış map
 */
export const subCategoryMap: Record<string, string> = Object.fromEntries(
  categories.flatMap(cat =>
    (cat.subcategories || []).map(sub => [sub.slug, sub.name])
  )
);

/**
 * Kategori slug'ının geçerli olup olmadığını kontrol eder
 */
export function isValidCategorySlug(slug: string): boolean {
  return slug in categoryMap;
}

/**
 * Alt kategori slug'ının geçerli olup olmadığını kontrol eder
 */
export function isValidSubCategorySlug(subSlug: string): boolean {
  return subSlug in subCategoryMap;
}

