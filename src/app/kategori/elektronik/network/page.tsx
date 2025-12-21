'use client'

import { FaWifi, FaNetworkWired, FaServer } from 'react-icons/fa'
import { useState } from 'react'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { Listing } from '@/types/listings'

const subcategories = [
  { id: 'router', name: 'Router', icon: <FaWifi className="inline mr-2 text-blue-500" /> },
  { id: 'switch', name: 'Switch', icon: <FaNetworkWired className="inline mr-2 text-blue-500" /> },
  { id: 'server', name: 'Server', icon: <FaServer className="inline mr-2 text-blue-500" /> },
]

export default function NetworkCategoryPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
    // Network ilanlarını filtrele
  const networkListings: Listing[] = listings
    .filter(listing => 
      listing.category === 'elektronik' && 
      listing.subCategory === 'network'
    )

  // Filtreleme fonksiyonu
  const filteredListings = networkListings.filter(listing => {
    if (selectedSubcategory && listing.subCategory !== selectedSubcategory) return false
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Network</h1>
        <p className="text-gray-600 mt-2">
          Router, switch ve server cihazları
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Filtreler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
            
            {/* Alt Kategoriler */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Tür</h3>
              <div className="space-y-2">
                {subcategories.map(subcategory => (
                  <label key={subcategory.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedSubcategory === subcategory.id}
                      onChange={() => setSelectedSubcategory(selectedSubcategory === subcategory.id ? null : subcategory.id)}
                    />
                    <span>{subcategory.icon}{subcategory.name}</span>
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
                {filteredListings.length} ilan bulundu
              </span>
              <select 
                className="border rounded-md p-2"
                aria-label="Sıralama seçenekleri"
              >
                <option value="newest">En Yeni</option>
                <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
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
                İlan Bulunamadı
              </h3>
              <p className="text-gray-600">
                Seçtiğiniz kriterlere uygun ilan bulunamadı. Lütfen filtreleri değiştirerek tekrar deneyin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
