'use client'

import { FaTshirt, FaShoePrints, FaGlasses } from 'react-icons/fa'
import { useState } from 'react'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { Listing } from '@/types/listings'
import Link from 'next/link'

const subcategories = [
  { id: 'bayan', name: 'Bayan Giyim', icon: <FaTshirt className="inline mr-2 text-pink-500" /> },
  { id: 'erkek', name: 'Erkek Giyim', icon: <FaTshirt className="inline mr-2 text-blue-500" /> },
  { id: 'ayakkabi', name: 'Ayakkabı', icon: <FaShoePrints className="inline mr-2 text-gray-500" /> },
  { id: 'aksesuar', name: 'Aksesuar', icon: <FaGlasses className="inline mr-2 text-purple-500" /> },
]

export default function GiyimCategoryPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string | null>(null)

  // Giyim ilanlarını filtrele ve types/listings.ts formatına dönüştür
  const giyimListings: Listing[] = listings
    .filter(listing => 
      listing.category === 'giyim'
    )
    

  // Filtreleme fonksiyonu
  const filteredListings = giyimListings.filter(listing => {
    if (selectedSubcategory && listing.subCategory !== selectedSubcategory) return false
    if (priceRange) {
      const price = listing.price
      const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
      switch (priceRange) {
        case '0-5000':
          if (numericPrice > 5000) return false
          break
        case '5000-10000':
          if (numericPrice < 5000 || numericPrice > 10000) return false
          break
        case '10000-20000':
          if (numericPrice < 10000 || numericPrice > 20000) return false
          break
        case '20000+':
          if (numericPrice < 20000) return false
          break
      }
    }
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Giyim</h1>
        <p className="text-gray-600 mt-2">
          Kadın, erkek, ayakkabı ve aksesuar ürünleri
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
                  <Link
                    key={subcategory.id}
                    href={`/kategori/giyim/${subcategory.id === 'erkek' ? 'erkek-giyim' : subcategory.id === 'bayan' ? 'bayan-giyim' : subcategory.id}`}
                    className={`block px-3 py-2 rounded-md hover:bg-gray-100 ${
                      selectedSubcategory === subcategory.id ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    {subcategory.icon}{subcategory.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Fiyat Aralığı Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Fiyat Aralığı</h3>
              <div className="space-y-2">
                {[
                  { value: '0-5000', label: '0 - 5.000 TL' },
                  { value: '5000-10000', label: '5.000 - 10.000 TL' },
                  { value: '10000-20000', label: '10.000 - 20.000 TL' },
                  { value: '20000+', label: '20.000 TL ve üzeri' }
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

