'use client'

import { useParams } from 'next/navigation'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { useState } from 'react'

export default function OzelYemeklerCategoryPage() {
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string | null>(null)
  const [features, setFeatures] = useState<string[]>([])

  // Özel yemekler ilanlarını filtrele
  const ozelYemeklerListings = listings.filter(listing => 
    listing.category === 'yemek-icecek' && 
    listing.subCategory === 'ozel-yemekler'
  )

  // Mutfak türlerini topla
  // const cuisines = Array.from(new Set(ozelYemeklerListings.map(listing => listing.brand)))

  // Filtreleme fonksiyonu
  const filteredListings = ozelYemeklerListings.filter(listing => {
    // if (selectedCuisine && listing.brand !== selectedCuisine) return false
    if (priceRange) {
      const price = listing.price
      switch (priceRange) {
        case '0-200':
          if (price > 200) return false
          break
        case '200-500':
          if (price < 200 || price > 500) return false
          break
        case '500-1000':
          if (price < 500 || price > 1000) return false
          break
        case '1000+':
          if (price < 1000) return false
          break
      }
    }
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Özel Yemekler</h1>
        <p className="text-gray-600 mt-2">
          Ev yapımı, özel menü ve catering hizmetlerini keşfedin.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Filtreler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
            
            {/* Mutfak Türü Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Mutfak Türü</h3>
              <div className="space-y-2">
                {/* {cuisines.map(cuisine => (
                  <label key={cuisine} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedCuisine === cuisine}
                      onChange={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
                    />
                    <span>{cuisine}</span>
                  </label>
                ))} */}
              </div>
            </div>

            {/* Özellikler Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Özellikler</h3>
              <div className="space-y-2">
                {[
                  'Ev Yapımı',
                  'Catering',
                  'Özel Menü',
                  'Parti Servisi',
                  'Vegan Seçenekler',
                  'Glutensiz Seçenekler',
                  'Organik Malzeme',
                  'Özel Sipariş'
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

            {/* Fiyat Aralığı Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Ortalama Kişi Başı</h3>
              <div className="space-y-2">
                {[
                  { value: '0-200', label: '0 - 200 TL' },
                  { value: '200-500', label: '200 - 500 TL' },
                  { value: '500-1000', label: '500 - 1.000 TL' },
                  { value: '1000+', label: '1.000 TL ve üzeri' }
                ].map(range => (
                  <label key={range.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={priceRange === range.value}
                      onChange={() => setPriceRange(priceRange === range.value ? null : range.value)}
                    />
                    <span>{range.label}</span>
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
                {filteredListings.length} mekan bulundu
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
                Mekan Bulunamadı
              </h3>
              <p className="text-gray-600">
                Seçtiğiniz kriterlere uygun mekan bulunamadı. Lütfen filtreleri değiştirerek tekrar deneyin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 

