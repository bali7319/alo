'use client'

import { FaFutbol, FaBasketballBall, FaVolleyballBall, FaHockeyPuck } from 'react-icons/fa'
import { GiBaseballBat, GiBoxingGlove } from 'react-icons/gi'
import { useState } from 'react'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'

const subcategories = [
  { id: 'futbol', name: 'Futbol', icon: <FaFutbol className="text-green-500" /> },
  { id: 'basketbol', name: 'Basketbol', icon: <FaBasketballBall className="text-orange-500" /> },
  { id: 'voleybol', name: 'Voleybol', icon: <FaVolleyballBall className="text-blue-500" /> },
  { id: 'hentbol', name: 'Hentbol', icon: <GiBoxingGlove className="text-red-500" /> },
  { id: 'beyzbol', name: 'Beyzbol', icon: <GiBaseballBat className="text-yellow-600" /> },
  { id: 'hokey', name: 'Hokey', icon: <FaHockeyPuck className="text-gray-700" /> }
]

export default function TakimSporlariPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
    const [condition, setCondition] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('newest')
  const [isLoading, setIsLoading] = useState(false)

  // Filtreleri temizle
  const clearFilters = () => {
    setSelectedSubcategory(null)
    setCondition(null)
  }

  // Takım sporları ilanlarını filtrele
  const takimSporlariListings = listings.filter(listing => 
    listing.category === 'sporlar-oyunlar-eglenceler' && 
    listing.subCategory === 'takim-sporlari'
  )

  // Filtreleme fonksiyonu
  const filteredListings = takimSporlariListings.filter(listing => {
    if (selectedSubcategory && listing.subCategory !== selectedSubcategory) return false
    return true
  })

  // Sıralama fonksiyonu
  const sortedListings = [...filteredListings].sort((a, b) => {
    const priceA = typeof a.price === 'string' ? parseFloat(a.price) : Number(a.price)
    const priceB = typeof b.price === 'string' ? parseFloat(b.price) : Number(b.price)
    switch (sortBy) {
      case 'price-asc':
        return priceA - priceB
      case 'price-desc':
        return priceB - priceA
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Takım Sporları</h1>
        <p className="text-gray-600 mt-2">
          Futbol, basketbol, voleybol ve diğer takım sporları için ekipman ve malzemeler
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Filtreler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filtreler</h2>
              {(selectedSubcategory || priceRange || condition) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
            
            {/* Alt Kategoriler */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Spor Türü</h3>
              <div className="space-y-2">
                {subcategories.map(subcategory => (
                  <label key={subcategory.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedSubcategory === subcategory.id}
                      onChange={() => setSelectedSubcategory(selectedSubcategory === subcategory.id ? null : subcategory.id)}
                    />
                    <span className="flex items-center">
                      {subcategory.icon}
                      <span className="ml-2">{subcategory.name}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            

            {/* Durum Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Durum</h3>
              <div className="space-y-2">
                {['Yeni', 'İkinci El'].map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={condition === status}
                      onChange={() => setCondition(condition === status ? null : status)}
                    />
                    <span>{status}</span>
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
                {sortedListings.length} ilan bulundu
              </span>
              <select 
                className="border rounded-md p-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sıralama seçenekleri"
              >
                <option value="newest">En Yeni</option>
                <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
              </select>
            </div>
          </div>

          {/* İlanlar */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">İlanlar yükleniyor...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {/* Sonuç Bulunamadı */}
          {!isLoading && sortedListings.length === 0 && (
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
