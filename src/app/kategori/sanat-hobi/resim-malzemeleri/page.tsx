'use client'

import { useParams } from 'next/navigation'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { useState } from 'react'
import { Listing } from '@/types/listings'

export default function ArtSuppliesCategoryPage() {
    // Resim malzemelerini filtrele
  const artSuppliesListings: Listing[] = listings
    .filter(listing =>
      listing.category === 'sanat-hobi' &&
      listing.subCategory === 'resim-malzemeleri'
    )
    

  // Filtreleme fonksiyonu
  const filteredListings = artSuppliesListings.filter(listing => {
    if (priceRange) {
      const price = listing.price
      const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
      switch (priceRange) {
        case '0-100':
          if (numericPrice > 100) return false
          break
        case '100-500':
          if (numericPrice < 100 || numericPrice > 500) return false
          break
        case '500-1000':
          if (numericPrice < 500 || numericPrice > 1000) return false
          break
        case '1000+':
          if (numericPrice < 1000) return false
          break
      }
    }
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resim Malzemeleri</h1>
        <p className="text-gray-600 mt-2">
          Boya, fırça, tuval ve diğer resim malzemeleri.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Filtreler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
            
            
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="flex-1 space-y-8">
          {/* Sıralama ve Sonuç Sayısı */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {filteredListings.length} ürün bulundu
              </span>
              <select 
                className="border rounded-md p-2"
                aria-label="Sıralama seçenekleri"
              >
                <option value="newest">En Yeni</option>
                <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
                <option value="rating">Puana Göre</option>
              </select>
            </div>
          </div>

          {/* İlanlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Sonuç Bulunamadı */}
          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ürün Bulunamadı
              </h3>
              <p className="text-gray-600">
                Seçtiğiniz kriterlere uygun resim malzemesi bulunamadı. Lütfen filtreleri değiştirerek tekrar deneyin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 

