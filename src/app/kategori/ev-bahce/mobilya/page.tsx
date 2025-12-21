'use client'

import { FaCouch, FaChair, FaBed } from 'react-icons/fa'
import { useState } from 'react'
import Link from 'next/link'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'

const subcategories = [
  { id: 'koltuk', name: 'Koltuk', icon: <FaCouch className="inline mr-2 text-orange-500" />, slug: 'koltuk' },
  { id: 'masa-sandalye', name: 'Masa Sandalye', icon: <FaChair className="inline mr-2 text-amber-600" />, slug: 'masa-sandalye' },
  { id: 'yatak-odasi', name: 'Yatak Odası', icon: <FaBed className="inline mr-2 text-blue-500" />, slug: 'yatak-odasi' },
]

export default function MobilyaCategoryPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
    const [condition, setCondition] = useState<string | null>(null)

  // Mobilya ilanlarını filtrele
  const mobilyaListings = listings.filter(listing =>
    listing.category === 'ev-bahce' &&
    listing.subCategory === 'mobilya'
  )

  // Filtreleme fonksiyonu
  const filteredListings = mobilyaListings.filter(listing => {
    if (selectedSubcategory && listing.subCategory !== selectedSubcategory) return false
    if (condition && undefined !== condition) return false
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mobilya</h1>
        <p className="text-gray-600 mt-2">
          Koltuk, masa sandalye, yatak odası ve diğer mobilya ürünleri
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Filtreler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Alt Kategoriler</h2>
            
            {/* Alt Kategoriler */}
            <div className="mb-6">
              <div className="space-y-2">
                {subcategories.map(subcategory => (
                  <Link
                    key={subcategory.id}
                    href={`/kategori/ev-bahce/mobilya/${subcategory.slug}`}
                    className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {subcategory.icon}{subcategory.name}
                  </Link>
                ))}
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-4">Filtreler</h2>


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
