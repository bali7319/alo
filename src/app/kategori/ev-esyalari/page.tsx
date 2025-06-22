'use client'

import { FaHome } from 'react-icons/fa'
import Link from 'next/link'
import { useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { Listing } from '@/types/listings'

const subcategories = [
  { id: 'mobilya', name: 'Mobilya', icon: <FaHome className="inline mr-2 text-orange-500" /> },
  { id: 'dekorasyon', name: 'Dekorasyon', icon: <FaHome className="inline mr-2 text-orange-500" /> },
  { id: 'mutfak-gerecleri', name: 'Mutfak Gereçleri', icon: <FaHome className="inline mr-2 text-orange-500" /> },
]

export default function EvEsyalariCategoryPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  // Ev eşyaları ilanlarını filtrele
  const evEsyalariListings: Listing[] = rawListings
    .filter(listing => 
      listing.category === 'ev-esyalari'
    )

  // Filtreleme fonksiyonu
  const filteredListings = evEsyalariListings.filter(listing => {
    if (selectedSubcategory && listing.subCategory !== selectedSubcategory) return false
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ev Eşyaları</h1>
        <p className="text-gray-600 mt-2">
          Ev eşyaları ve mutfak gereçleri
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Kategoriler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Kategoriler</h2>
              <div className="space-y-2">
                {subcategories.map(subcategory => (
                  <button
                    key={subcategory.id}
                    onClick={() => setSelectedSubcategory(subcategory.id)}
                    className={`block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 ${
                      selectedSubcategory === subcategory.id ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    {subcategory.icon}{subcategory.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Ana İçerik */}
        <div className="flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
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
