'use client';

import React from 'react';
import Link from 'next/link';
import { ListingCard } from './listing-card';
import { Listing } from '@/types/listings';

interface LatestAdsProps {
  category?: string;
  subcategory?: string;
  subSubcategory?: string;
  limit?: number;
  title?: string;
  listings?: Listing[];
}

export function LatestAds({ category, subcategory, subSubcategory, limit = 6, title, listings = [] }: LatestAdsProps) {
  const filteredAds = listings.filter(ad => {
    if (category && subcategory && subSubcategory) {
      return ad.category.toLowerCase() === category.toLowerCase() && 
             ad.subCategory?.toLowerCase() === subcategory.toLowerCase() &&
             ad.subSubCategory?.toLowerCase() === subSubcategory.toLowerCase();
    } else if (category && subcategory) {
      return ad.category.toLowerCase() === category.toLowerCase() && 
             ad.subCategory?.toLowerCase() === subcategory.toLowerCase();
    } else if (category) {
      return ad.category.toLowerCase() === category.toLowerCase();
    }
    return true;
  });

  // En son eklenen ilanları al
  const sortedAds = [...filteredAds].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const displayAds = sortedAds.slice(0, limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title || "En Son İlanlar"}</h2>
        {category && subcategory && subSubcategory && (
          <Link href={`/kategori/${category.toLowerCase()}/${subcategory.toLowerCase()}/${subSubcategory.toLowerCase()}`} className="text-blue-600 hover:text-blue-800">
            Tümünü Gör
          </Link>
        )}
        {category && subcategory && !subSubcategory && (
          <Link href={`/kategori/${category.toLowerCase()}/${subcategory.toLowerCase()}`} className="text-blue-600 hover:text-blue-800">
            Tümünü Gör
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayAds.map((ad) => (
          <ListingCard key={ad.id} listing={ad} />
        ))}
      </div>
    </div>
  );
} 
