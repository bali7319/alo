'use client'

import { FaUtensils, FaCoffee, FaBirthdayCake, FaHamburger, FaGlassMartini } from 'react-icons/fa'
import Link from 'next/link'
import { useState } from 'react'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { Listing } from '@/types/listings'

const subcategories = [
  { id: 'restoranlar', name: 'Restoranlar', icon: <FaUtensils className="inline mr-2 text-orange-500" /> },
  { id: 'kafeler', name: 'Kafeler', icon: <FaCoffee className="inline mr-2 text-amber-600" /> },
  { id: 'fast-food', name: 'Fast Food', icon: <FaHamburger className="inline mr-2 text-red-500" /> },
  { id: 'tatli-pastane', name: 'Tatlı & Pastane', icon: <FaBirthdayCake className="inline mr-2 text-pink-500" /> },
  { id: 'ozel-yemekler', name: 'Özel Yemekler', icon: <FaGlassMartini className="inline mr-2 text-purple-500" /> },
]

export default function YemekIcecekPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string | null>(null)

  // Yemek-icecek ilanlarını filtrele ve types/listings.ts formatına dönüştür
  const yemekIcecekListings: Listing[] = listings
    .filter(listing => 
      listing.category === 'yemek-icecek'
    )
    

  // Filtreleme fonksiyonu
  const filteredListings = yemekIcecekListings.filter(listing => {
    if (selectedSubcategory && listing.subCategory !== selectedSubcategory) return false
    if (priceRange) {
      const price = listing.price
      const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
      switch (priceRange) {
        case '0-200':
          if (numericPrice > 200) return false
          break
        case '200-500':
          if (numericPrice < 200 || numericPrice > 500) return false
          break
        case '500-1000':
          if (numericPrice < 500 || numericPrice > 1000) return false
          break
        case '1000+':
          if (numericPrice < 1000) return false
          break
      }
    }
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Yemek ve İçecek</h1>
        <p className="text-gray-600 mt-2">
          Restoranlar, kafeler, fast food ve daha birçok lezzet durağını keşfedin.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Alt Kategoriler ve Filtreler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Alt Kategoriler</h2>
            <div className="space-y-2 mb-6">
              {subcategories.map(subcategory => (
                <Link
                  key={subcategory.id}
                  href={`/kategori/yemek-icecek/${subcategory.id}`}
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {subcategory.icon}{subcategory.name}
                </Link>
              ))}
            </div>

            <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
            
            {/* Alt Kategori Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Kategori</h3>
              <div className="space-y-2">
                {subcategories.map(subcategory => (
                  <label key={subcategory.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedSubcategory === subcategory.id}
                      onChange={() => setSelectedSubcategory(selectedSubcategory === subcategory.id ? null : subcategory.id)}
                    />
                    <span className="text-sm">{subcategory.name}</span>
                  </label>
                ))}
              </div>
            </div>

            
          </div>
        </div>

        {/* Ana İçerik - İlanlar */}
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

