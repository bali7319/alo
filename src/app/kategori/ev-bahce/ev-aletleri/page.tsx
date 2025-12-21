'use client'

import { FaTv, FaBlender, FaUtensils } from 'react-icons/fa'
import { useState } from 'react'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'

const subcategories = [
  { id: 'beyaz-esya', name: 'Beyaz Eşya', icon: <FaTv className="inline mr-2 text-blue-500" /> },
  { id: 'kucuk-ev-aleti', name: 'Küçük Ev Aleti', icon: <FaBlender className="inline mr-2 text-blue-500" /> },
  { id: 'mutfak-aleti', name: 'Mutfak Aleti', icon: <FaUtensils className="inline mr-2 text-blue-500" /> },
]

export default function EvAletleriCategoryPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
    const [condition, setCondition] = useState<string | null>(null)

  // Ev aletleri ilanlarını filtrele
  const evAletleriListings = listings.filter(listing =>
    listing.category === 'ev-bahce' &&
    listing.subCategory === 'ev-aletleri'
  )

  // Filtreleme fonksiyonu
  const filteredListings = evAletleriListings.filter(listing => {
    if (selectedSubcategory && listing.subCategory !== selectedSubcategory) return false
    if (condition && undefined !== condition) return false
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ev Aletleri</h1>
        <p className="text-gray-600 mt-2">
          Beyaz eşya, küçük ev aletleri ve mutfak aletleri
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
