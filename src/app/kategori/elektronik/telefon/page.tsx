'use client'

import { FaMobile, FaTabletAlt, FaHeadphones, FaApple, FaAndroid } from 'react-icons/fa'
import { useState } from 'react'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { Listing } from '@/types/listings'
import Link from 'next/link'

const subcategories = [
  { id: 'akilli-telefon', name: 'Akıllı Telefon', icon: <FaMobile className="inline mr-2 text-blue-500" /> },
  { id: 'tablet', name: 'Tablet', icon: <FaTabletAlt className="inline mr-2 text-blue-500" /> },
  { id: 'aksesuar', name: 'Aksesuar', icon: <FaHeadphones className="inline mr-2 text-blue-500" /> },
  { id: 'diger', name: 'Diğer', icon: <FaMobile className="inline mr-2 text-gray-500" /> },
]

const brands = [
  { id: 'apple', name: 'Apple', icon: <FaApple className="inline mr-2 text-gray-600" /> },
  { id: 'samsung', name: 'Samsung', icon: <FaAndroid className="inline mr-2 text-green-500" /> },
  { id: 'xiaomi', name: 'Xiaomi', icon: <FaAndroid className="inline mr-2 text-orange-500" /> },
  { id: 'huawei', name: 'Huawei', icon: <FaAndroid className="inline mr-2 text-red-500" /> },
]

export default function TelefonCategoryPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
    // Telefon ilanlarını filtrele
  const telefonListings: Listing[] = listings
    .filter(listing => 
      listing.category === 'elektronik' && 
      listing.subCategory === 'telefon'
    )

  // Filtreleme fonksiyonu
  const filteredListings = telefonListings.filter(listing => {
    if (selectedSubcategory && listing.subCategory !== selectedSubcategory) return false
    if (selectedBrand && listing.title.toLowerCase().indexOf(selectedBrand.toLowerCase()) === -1) return false
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Ana Sayfa
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/kategori/elektronik" className="text-gray-700 hover:text-blue-600">
                Elektronik
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">Telefon & Tablet</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Telefon & Tablet</h1>
        <p className="text-gray-600">
          Akıllı telefonlar, tabletler ve aksesuarlar - En yeni modeller ve uygun fiyatlar
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sol Sidebar - Filtreler */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaMobile className="w-5 h-5 text-blue-500 mr-2" />
              Filtreler
            </h2>
            
            {/* Marka Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Marka</h3>
              <div className="space-y-2">
                {brands.map(brand => (
                  <label key={brand.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 rounded"
                      checked={selectedBrand === brand.id}
                      onChange={() => setSelectedBrand(selectedBrand === brand.id ? null : brand.id)}
                    />
                    <span className="text-sm">{brand.icon}{brand.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Alt Kategoriler */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Tür</h3>
              <div className="space-y-2">
                {subcategories.map(subcategory => (
                  <label key={subcategory.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 rounded"
                      checked={selectedSubcategory === subcategory.id}
                      onChange={() => setSelectedSubcategory(selectedSubcategory === subcategory.id ? null : subcategory.id)}
                    />
                    <span className="text-sm">{subcategory.icon}{subcategory.name}</span>
                  </label>
                ))}
              </div>
            </div>


            {/* Filtreleri Temizle */}
            {(selectedSubcategory || selectedBrand) && (
              <button
                onClick={() => {
                  setSelectedSubcategory(null)
                  setSelectedBrand(null)
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm transition-colors"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="flex-1 space-y-6">
          {/* Sıralama ve Sonuç Sayısı */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <select 
                className="border rounded-md p-2 text-sm"
                aria-label="Sıralama seçenekleri"
              >
                <option value="newest">En Yeni</option>
                <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
                <option value="popular">En Popüler</option>
              </select>
            </div>
          </div>

          {/* İlanlar */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <FaMobile className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                İlan Bulunamadı
              </h3>
              <p className="text-gray-600 mb-4">
                Seçtiğiniz kriterlere uygun telefon & tablet ilanı bulunamadı.
              </p>
              <button
                onClick={() => {
                  setSelectedSubcategory(null)
                  setSelectedBrand(null)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
