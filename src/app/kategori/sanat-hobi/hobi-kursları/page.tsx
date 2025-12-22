'use client'

import { useParams } from 'next/navigation'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { useState } from 'react'

export default function HobbyCoursesCategoryPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
    const [location, setLocation] = useState<string | null>(null)

  // Hobi kurslarını filtrele
  const courseListings = listings.filter(listing => 
    listing.category === 'sanat-hobi' && 
    listing.subCategory === 'hobi-kursları'
  )

  // Filtreleme fonksiyonu
  const filteredListings = courseListings.filter(listing => {
    if (selectedType && listing.subCategory !== selectedType) return false
    if (location && listing.location !== location) return false
    
    }
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hobi Kursları</h1>
        <p className="text-gray-600 mt-2">
          Resim, müzik, el işi ve diğer hobi kursları.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Filtreler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
            
            {/* Kurs Tipi Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Kurs Tipi</h3>
              <div className="space-y-2">
                {[
                  'Resim Kursu',
                  'Müzik Kursu',
                  'El İşi Kursu',
                  'Seramik Kursu',
                  'Fotoğrafçılık',
                  'Dans Kursu',
                  'Yoga Kursu',
                  'Dikiş Kursu',
                  'Takı Tasarım',
                  'Ebru Kursu',
                  'Vitray Kursu',
                  'Diğer'
                ].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedType === type}
                      onChange={() => setSelectedType(selectedType === type ? null : type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Konum Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Konum</h3>
              <div className="space-y-2">
                {[
                  'İstanbul',
                  'Ankara',
                  'İzmir',
                  'Bursa',
                  'Antalya',
                  'Adana',
                  'Konya',
                  'Gaziantep',
                  'Kayseri',
                  'Mersin',
                  'Diyarbakır',
                  'Eskişehir'
                ].map(city => (
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
                {filteredListings.length} kurs bulundu
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
                Kurs Bulunamadı
              </h3>
              <p className="text-gray-600">
                Seçtiğiniz kriterlere uygun hobi kursu bulunamadı. Lütfen filtreleri değiştirerek tekrar deneyin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
