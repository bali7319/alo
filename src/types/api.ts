/**
 * API Response Types
 * Tüm API route'ları için type tanımları
 */

import { Prisma } from '@prisma/client';

/**
 * Listing response type (API'den dönen format)
 */
export interface ListingResponse {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string | null;
  subCategory: string | null;
  description: string;
  images: string[];
  createdAt: string;
  condition: string | null;
  isPremium: boolean;
  premiumUntil: string | null;
  expiresAt: string;
  // views sadece ilan sahibi/admin için dönebilir
  views?: number;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Category listings API response
 */
export interface CategoryListingsResponse {
  listings: ListingResponse[];
  pagination: PaginationMeta;
}

/**
 * Prisma Listing where clause type
 */
export type ListingWhereInput = Prisma.ListingWhereInput;

/**
 * Prisma Listing select type
 */
export type ListingSelect = Prisma.ListingSelect;

