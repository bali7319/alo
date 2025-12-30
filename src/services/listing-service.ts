/**
 * Listing Service Layer
 * Business logic'i API route'larından ayırır
 */

import { prisma } from '@/lib/prisma';
import { getAdminEmail } from '@/lib/admin';
import type { ListingWhereInput } from '@/types/api';
import { Prisma } from '@prisma/client';

/**
 * Admin kullanıcısını cache'ler (performans için)
 */
let adminUserCache: { id: string } | null = null;
let adminUserCacheTime = 0;
const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 dakika

/**
 * Admin kullanıcısını getirir (cache'li)
 */
export async function getAdminUser(): Promise<{ id: string } | null> {
  const now = Date.now();
  
  // Cache hala geçerliyse döndür
  if (adminUserCache && (now - adminUserCacheTime) < ADMIN_CACHE_TTL) {
    return adminUserCache;
  }

  // Cache yoksa veya süresi dolmuşsa database'den al
  const adminUser = await prisma.user.findUnique({
    where: { email: getAdminEmail() },
    select: { id: true },
  });

  // Cache'e kaydet
  if (adminUser) {
    adminUserCache = adminUser;
    adminUserCacheTime = now;
  }

  return adminUser;
}

/**
 * Kategori filtresi oluşturur
 */
export function createCategoryFilter(
  slug: string,
  categoryName: string | undefined
): ListingWhereInput {
  return categoryName
    ? {
        OR: [
          { category: categoryName },
          { category: slug },
        ]
      }
    : { category: slug };
}

/**
 * Temel listing where clause oluşturur (admin hariç, aktif, onaylı, süresi dolmamış)
 */
export async function createBaseListingWhereClause(
  additionalFilters: ListingWhereInput = {}
): Promise<ListingWhereInput> {
  try {
    const adminUser = await getAdminUser();
    
    const whereClause: ListingWhereInput = {
      ...additionalFilters,
      isActive: true,
      approvalStatus: 'approved',
      expiresAt: {
        gt: new Date()
      }
    };

    // Admin kullanıcısının ilanlarını hariç tut (sadece admin user varsa)
    if (adminUser?.id) {
      whereClause.userId = { not: adminUser.id };
    }

    return whereClause;
  } catch (error) {
    // Admin user alınamazsa, admin filtresi olmadan devam et
    console.warn('Admin user alınamadı, admin filtresi uygulanmadı:', error);
    return {
      ...additionalFilters,
      isActive: true,
      approvalStatus: 'approved',
      expiresAt: {
        gt: new Date()
      }
    };
  }
}

/**
 * Listing'leri güvenli şekilde parse eder
 */
export function safeParseImages(images: string | null): string[] {
  if (!images) return [];
  try {
    if (typeof images === 'string') {
      if (images.startsWith('data:image')) {
        return [images];
      }
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    }
    return Array.isArray(images) ? images : [];
  } catch {
    return [];
  }
}

/**
 * Description'ı kısaltır (liste görünümü için)
 */
export function truncateDescription(description: string | null, maxLength: number = 200): string {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + '...';
}

