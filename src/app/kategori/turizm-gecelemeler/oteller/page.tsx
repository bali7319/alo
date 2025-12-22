'use client'

import { useParams } from 'next/navigation'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { useState } from 'react'

export default function HotelsCategoryPage() {
  const [selectedStar, setSelectedStar] = useState<string | null>(null)
    const [location, setLocation] = useState<string | null>(null)
  const [features, setFeatures] = useState<string[]>([])

  // Otel ilanlarını filtrele
  const hotelListings = listings.filter(listing => 
    listing.category === 'turizm-gecelemeler' && 
    listing.subCategory === 'oteller'
  )

  // Yıldız sayılarını topla
  const stars = Array.from(new Set(hotelListings.map(listing => listing.subCategory)))

  // Filtreleme fonksiyonu
  const filteredListings = hotelListings.filter(listing => {
    if (selectedStar && listing.subCategory !== selectedStar) return false
    if (location && listing.location !== location) return false
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Oteller</h1>
        <p className="text-gray-600 mt-2">
          Lüks, butik ve ekonomik otelleri keşfedin.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Filtreler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
            
            {/* Yıldız Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Yıldız</h3>
              <div className="space-y-2">
                {stars.map(star => (
                  <label key={star} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedStar === star}
                      onChange={() => setSelectedStar(selectedStar === star ? null : (star ?? ''))}
                    />
                    <span>{star}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Özellikler Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Özellikler</h3>
              <div className="space-y-2">
                {[
                  'Havuz',
                  'Spa',
                  'Fitness',
                  'Restoran',
                  'Bar',
                  'Çocuk Kulübü',
                  'Ücretsiz Wi-Fi',
                  'Otopark'
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

            {/* Konum Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Konum</h3>
              <div className="space-y-2">
                {['İstanbul', 'Antalya', 'Muğla', 'Aydın', 'İzmir'].map(city => (
                  <label key={city} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={location === city}
                      onChange={() => setLocation(location === city ? null : city)}
                    />
                    <span>{city}</span>
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
                {filteredListings.length} otel bulundu
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
                Otel Bulunamadı
              </h3>
              <p className="text-gray-600">
                Seçtiğiniz kriterlere uygun otel bulunamadı. Lütfen filtreleri değiştirerek tekrar deneyin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 

