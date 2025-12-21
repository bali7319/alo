'use client'

import { useParams } from 'next/navigation'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { useState } from 'react'

export default function CafesCategoryPage() {
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string | null>(null)
  const [features, setFeatures] = useState<string[]>([])

  // Kafe ilanlarını filtrele
  const kafeListings = listings.filter(listing => 
    listing.category === 'yemek-icecek' && 
    listing.subCategory === 'kafeler'
  )

  // Filtreleme fonksiyonu
  const filteredListings = kafeListings.filter(listing => {
    // if (selectedCuisine && listing.brand !== selectedCuisine) return false
    if (priceRange) {
      const price = listing.price
      const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
      switch (priceRange) {
        case '0-50':
          if (numericPrice > 50) return false
          break
        case '50-100':
          if (numericPrice < 50 || numericPrice > 100) return false
          break
        case '100-200':
          if (numericPrice < 100 || numericPrice > 200) return false
          break
        case '200+':
          if (numericPrice < 200) return false
          break
      }
    }
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kafeler</h1>
        <p className="text-gray-600 mt-2">
          Kahve, tatlı ve atıştırmalıklar için en iyi kafeleri keşfedin.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Filtreler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
            
            {/* Kafe Türü Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Kafe Türü</h3>
              <div className="space-y-2">
                {kafeListings.map(listing => (
                  <label key={listing.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedCuisine === listing.id}
                      onChange={() => setSelectedCuisine(selectedCuisine === listing.id ? null : String(listing.id))}
                    />
                    <span>{listing.title}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Özellikler Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Özellikler</h3>
              <div className="space-y-2">
                {[
                  'Açık Hava',
                  'Teras',
                  'Wi-Fi',
                  'Çalışma Alanı',
                  'Kahvaltı',
                  'Tatlı Çeşitleri',
                  'Vegan Seçenekler',
                  'Glutensiz Seçenekler'
                ].map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={features.includes(feature)}
                      onChange={() => {
                        if (features.includes(feature)) {
                          setFeatures(features.filter(f => f !== feature))
                        } else {
                          setFeatures([...features, feature])
                        }
                      }}
                    />
                    <span>{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="flex-1 space-y-8">
          {/* Sıralama ve Sonuç Sayısı */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {filteredListings.length} kafe bulundu
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
                Kafe Bulunamadı
              </h3>
              <p className="text-gray-600">
                Seçtiğiniz kriterlere uygun kafe bulunamadı. Lütfen filtreleri değiştirerek tekrar deneyin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 

