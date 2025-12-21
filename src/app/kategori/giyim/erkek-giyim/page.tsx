'use client'

import { FaTshirt, FaShoePrints, FaGlasses, FaRunning, FaUmbrellaBeach, FaShoppingBag, FaUser } from 'react-icons/fa'
import { GiClothes, GiUnderwearShorts, GiWinterHat } from 'react-icons/gi'
import { useState } from 'react'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { Listing } from '@/types/listings'

const subcategories = [
  // 1. Üst Giyim
  { id: 'ust-giyim', name: 'Üst Giyim', icon: <FaTshirt className="inline mr-2 text-blue-500" />, items: [
    'Tişört', 'Gömlek', 'Sweatshirt', 'Kazak', 'Hırka', 'Polo yaka tişört', 'Atlet'
  ]},
  // 2. Alt Giyim
  { id: 'alt-giyim', name: 'Alt Giyim', icon: <GiClothes className="inline mr-2 text-gray-500" />, items: [
    'Pantolon', 'Kot pantolon (jean)', 'Şort', 'Eşofman altı', 'Kumaş pantolon', 'Chino pantolon'
  ]},
  // 3. Takım Elbise & Klasik Giyim
  { id: 'takim-elbise', name: 'Takım Elbise & Klasik Giyim', icon: <FaUser className="inline mr-2 text-black" />, items: [
    'Ceket', 'Yelek', 'Takım elbise', 'Smokin', 'Gömlek (klasik)', 'Kravat / Papyon'
  ]},
  // 4. Dış Giyim
  { id: 'dis-giyim', name: 'Dış Giyim', icon: <GiWinterHat className="inline mr-2 text-gray-700" />, items: [
    'Mont', 'Kaban', 'Trençkot', 'Deri ceket', 'Şişme mont', 'Yağmurluk'
  ]},
  // 5. Ayakkabı
  { id: 'ayakkabi', name: 'Ayakkabı', icon: <FaShoePrints className="inline mr-2 text-brown-500" />, items: [
    'Klasik ayakkabı', 'Spor ayakkabı', 'Bot', 'Loafer', 'Terlik / Sandalet'
  ]},
  // 6. İç Giyim & Ev Giyimi
  { id: 'ic-giyim', name: 'İç Giyim & Ev Giyimi', icon: <GiUnderwearShorts className="inline mr-2 text-red-500" />, items: [
    'Boxer / Slip', 'Atlet', 'Fanila', 'Pijama', 'Sabahlık', 'Ev kıyafetleri'
  ]},
  // 7. Spor Giyim
  { id: 'spor-giyim', name: 'Spor Giyim', icon: <FaRunning className="inline mr-2 text-green-500" />, items: [
    'Spor tişört', 'Spor şort', 'Eşofman takımı', 'Spor ayakkabı', 'Spor taytı'
  ]},
  // 8. Aksesuar
  { id: 'aksesuar', name: 'Aksesuar', icon: <FaShoppingBag className="inline mr-2 text-yellow-500" />, items: [
    'Şapka / Bere', 'Gözlük', 'Cüzdan', 'Kemer', 'Çorap', 'Saat', 'Kravat / Papyon'
  ]},
  // 9. Plaj Giyimi
  { id: 'plaj-giyimi', name: 'Plaj Giyimi', icon: <FaUmbrellaBeach className="inline mr-2 text-orange-500" />, items: [
    'Deniz şortu', 'Mayo', 'Plaj terliği', 'Plaj çantası'
  ]}
]

export default function ErkekGiyimCategoryPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string | null>(null)

  // Erkek giyim ilanlarını filtrele ve types/listings.ts formatına dönüştür
  const erkekGiyimListings: Listing[] = listings
    .filter(listing => 
      listing.category === 'giyim' && 
      listing.subCategory === 'erkek-giyim'
    )
    

  // Filtreleme fonksiyonu
  const filteredListings = erkekGiyimListings.filter(listing => {
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
        <h1 className="text-3xl font-bold text-gray-900">Erkek Giyim</h1>
        <p className="text-gray-600 mt-2">
          Erkek giyim ürünleri, aksesuarlar ve daha fazlası
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

