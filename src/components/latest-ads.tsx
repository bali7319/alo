'use client';

import React from 'react';
import Link from 'next/link';
import { ListingCard } from './listing-card';
import { Listing } from '@/types/listings';
import { createSlug } from '@/lib/slug';

interface LatestAdsProps {
  category?: string;
  subcategory?: string;
  subSubcategory?: string;
  limit?: number;
  title?: string;
  listings?: Listing[];
}

export function LatestAds({ category, subcategory, subSubcategory, limit = 6, title, listings = [] }: LatestAdsProps) {
  const normalizeSlug = (value?: string) => (value ? createSlug(value) : '');
  const targetCategorySlug = category ? createSlug(category) : '';
  const targetSubcategorySlug = subcategory ? createSlug(subcategory) : '';
  const targetSubSubcategorySlug = subSubcategory ? createSlug(subSubcategory) : '';

  const filteredAds = listings.filter(ad => {
    const adCategorySlug = normalizeSlug(ad.category);
    const adSubCategorySlug = normalizeSlug(ad.subCategory);
    const adSubSubCategorySlug = normalizeSlug(ad.subSubCategory);

    const matchesCategory = !targetCategorySlug || adCategorySlug === targetCategorySlug;
    const matchesSubcategory = !targetSubcategorySlug || adSubCategorySlug === targetSubcategorySlug;
    const matchesSubSubcategory = !targetSubSubcategorySlug || adSubSubCategorySlug === targetSubSubcategorySlug;

    return matchesCategory && matchesSubcategory && matchesSubSubcategory;
  });

  // En son eklenen ilanları al
  const sortedAds = [...filteredAds].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const displayAds = sortedAds.slice(0, limit);

  return (
    <section aria-labelledby="latest-ads-title">
      <div className="flex items-center justify-between mb-6">
        <h2 id="latest-ads-title" className="text-2xl font-bold">{title || "En Son İlanlar"}</h2>
        {category && subcategory && subSubcategory && (
          <Link 
            href={`/kategori/${category.toLowerCase()}/${subcategory.toLowerCase()}/${subSubcategory.toLowerCase()}`} 
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            aria-label={`${subSubcategory} kategorisindeki tüm ilanları görüntüle`}
          >
            Tümünü Gör
          </Link>
        )}
        {category && subcategory && !subSubcategory && (
          <Link 
            href={`/kategori/${category.toLowerCase()}/${subcategory.toLowerCase()}`} 
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            aria-label={`${subcategory} kategorisindeki tüm ilanları görüntüle`}
          >
            Tümünü Gör
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="En son eklenen ilanlar listesi">
        {displayAds.map((ad) => (
          <div key={ad.id} role="listitem">
            <ListingCard listing={ad} />
          </div>
        ))}
      </div>
    </section>
  );
} 