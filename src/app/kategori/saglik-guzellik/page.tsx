'use client'

import { FaHeartbeat, FaSpa, FaUserMd } from 'react-icons/fa'
import Link from 'next/link'
import { useState } from 'react'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { Listing } from '@/types/listings'

const subcategories = [
  { id: 'kisisel-bakim', name: 'Kişisel Bakım', icon: <FaSpa className="inline mr-2 text-red-500" /> },
  { id: 'saglik-urunleri', name: 'Sağlık Ürünleri', icon: <FaHeartbeat className="inline mr-2 text-red-500" /> },
  { id: 'kozmetik', name: 'Kozmetik', icon: <FaUserMd className="inline mr-2 text-red-500" /> },
  { id: 'erkek-kuafor', name: 'Erkek Kuaför', icon: <FaUserMd className="inline mr-2 text-blue-500" /> },
  { id: 'guzellik-merkezi', name: 'Güzellik Merkezi', icon: <FaSpa className="inline mr-2 text-pink-500" /> },
  { id: 'bayan-kuafor', name: 'Bayan Kuaför', icon: <FaSpa className="inline mr-2 text-purple-500" /> },
]

export default function SaglikGuzellikCategoryPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  // Sağlık-güzellik ilanlarını filtrele ve types/listings.ts formatına dönüştür
  const saglikGuzellikListings: Listing[] = listings
    .filter(listing => 
      listing.category === 'saglik-guzellik'
    )
    

  // Filtreleme fonksiyonu
  const filteredListings = saglikGuzellikListings.filter(listing => {
    if (selectedSubcategory && listing.subCategory !== selectedSubcategory) return false
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sağlık ve Güzellik</h1>
        <p className="text-gray-600 mt-2">
          Sağlık ve güzellik ürünleri
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Kategoriler ve Filtreler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            {/* Alt Kategoriler */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Kategoriler</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className={`block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 ${
                    selectedSubcategory === null ? 'bg-gray-100 font-medium' : ''
                  }`}
                >
                  Tümü
                </button>
                {subcategories.map(subcategory => (
                  <Link
                    key={subcategory.id}
                    href={`/kategori/saglik-guzellik/${subcategory.id}`}
                    className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    {subcategory.icon}{subcategory.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="flex-1">
          {/* İlanlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Bu kategoride henüz ilan bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 

