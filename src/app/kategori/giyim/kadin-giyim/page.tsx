'use client'

import { useParams } from 'next/navigation'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { useState } from 'react'

export default function WomenClothingCategoryPage() {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
    const [condition, setCondition] = useState<string | null>(null)
  const [size, setSize] = useState<string | null>(null)

  // Kadın giyim ilanlarını filtrele
  const womenClothingListings = listings.filter(listing => 
    listing.category === 'giyim' && 
    listing.subCategory === 'kadin-giyim'
  )

  // Markaları topla
  const brands = ['Brand1', 'Brand2', 'Brand3']

  // Filtreleme fonksiyonu
  const filteredListings = womenClothingListings.filter(listing => {
    if (selectedBrand) return true // brand filtresini kaldırıyoruz çünkü Listing tipinde yok
    if (condition) return true // condition filtresini kaldırıyoruz çünkü Listing tipinde yok
    if (size) return true // features filtresini kaldırıyoruz çünkü Listing tipinde yok
    if (priceRange) {
      const price = listing.price
      const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
      switch (priceRange) {
        case '0-500':
          if (numericPrice > 500) return false
          break
        case '500-1000':
          if (numericPrice < 500 || numericPrice > 1000) return false
          break
        case '1000-2000':
          if (numericPrice < 1000 || numericPrice > 2000) return false
          break
        case '2000+':
          if (numericPrice < 2000) return false
          break
      }
    }
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bayan Giyim</h1>
        <p className="text-gray-600 mt-2">
          Kadın giyim ürünlerini inceleyebilir, kıyafet, ayakkabı ve aksesuar seçeneklerini keşfedebilirsiniz.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Filtreler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
            
            {/* Marka Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Marka</h3>
              <div className="space-y-2">
                {brands.map(brand => (
                  <label key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedBrand === brand}
                      onChange={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Beden Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Beden</h3>
              <div className="space-y-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sizeOption => (
                  <label key={sizeOption} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={size === sizeOption}
                      onChange={() => setSize(size === sizeOption ? null : sizeOption)}
                    />
                    <span>{sizeOption}</span>
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

