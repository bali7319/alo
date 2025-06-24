'use client'

import { FaTshirt, FaShoePrints, FaGlasses, FaRunning, FaUmbrellaBeach, FaShoppingBag } from 'react-icons/fa'
import { GiClothes, GiUnderwearShorts, GiWinterHat } from 'react-icons/gi'
import { useState } from 'react'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'

const subcategories = [
  // 1. Üst Giyim
  { id: 'ust-giyim', name: 'Üst Giyim', icon: <FaTshirt className="inline mr-2 text-pink-500" />, items: [
    'Tişört', 'Bluz', 'Gömlek', 'Kazak', 'Hırka', 'Sweatshirt', 'Crop top', 'Büstiyer'
  ]},
  // 2. Alt Giyim
  { id: 'alt-giyim', name: 'Alt Giyim', icon: <GiClothes className="inline mr-2 text-blue-500" />, items: [
    'Pantolon', 'Kot pantolon', 'Tayt', 'Etek', 'Şort', 'Kumaş pantolon'
  ]},
  // 3. Elbise & Tulum
  { id: 'elbise-tulum', name: 'Elbise & Tulum', icon: <FaTshirt className="inline mr-2 text-purple-500" />, items: [
    'Günlük elbise', 'Abiye elbise', 'Tulum', 'Kokteyl elbisesi', 'Düğün/nişan elbisesi'
  ]},
  // 4. Dış Giyim
  { id: 'dis-giyim', name: 'Dış Giyim', icon: <GiWinterHat className="inline mr-2 text-gray-500" />, items: [
    'Mont', 'Kaban', 'Trençkot', 'Ceket', 'Yelek', 'Şişme mont', 'Deri ceket'
  ]},
  // 5. İç Giyim & Ev Giyimi
  { id: 'ic-giyim', name: 'İç Giyim & Ev Giyimi', icon: <GiUnderwearShorts className="inline mr-2 text-red-500" />, items: [
    'Sütyen', 'Külot', 'Atlet', 'Gecelik', 'Sabahlık', 'Pijama takımı', 'Ev kıyafetleri'
  ]},
  // 6. Ayakkabı
  { id: 'ayakkabi', name: 'Ayakkabı', icon: <FaShoePrints className="inline mr-2 text-brown-500" />, items: [
    'Topuklu ayakkabı', 'Spor ayakkabı', 'Babet', 'Bot', 'Sandalet', 'Terlik'
  ]},
  // 7. Aksesuar
  { id: 'aksesuar', name: 'Aksesuar', icon: <FaShoppingBag className="inline mr-2 text-yellow-500" />, items: [
    'Çanta', 'Takı', 'Gözlük', 'Şapka', 'Kemer', 'Eşarp / Şal'
  ]},
  // 8. Spor Giyim
  { id: 'spor-giyim', name: 'Spor Giyim', icon: <FaRunning className="inline mr-2 text-green-500" />, items: [
    'Spor sütyeni', 'Spor taytı', 'Spor tişört', 'Eşofman takımı'
  ]},
  // 9. Plaj Giyimi
  { id: 'plaj-giyimi', name: 'Plaj Giyimi', icon: <FaUmbrellaBeach className="inline mr-2 text-orange-500" />, items: [
    'Bikini', 'Mayo', 'Plaj elbisesi', 'Pareo', 'Plaj çantası'
  ]}
]

export default function BayanGiyimCategoryPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string | null>(null)
  const [condition, setCondition] = useState<string | null>(null)

  // Bayan giyim ilanlarını filtrele
  const bayanGiyimListings = listings.filter(listing => 
    listing.category === 'giyim' && 
    listing.subCategory === 'bayan'
  )

  // Filtreleme fonksiyonu
  const filteredListings = bayanGiyimListings.filter(listing => {
    if (selectedSubcategory && listing.subCategory !== selectedSubcategory) return false
    if (condition) return true // condition filtresini kaldırıyoruz çünkü Listing tipinde yok
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
        <h1 className="text-3xl font-bold text-gray-900">Bayan Giyim</h1>
        <p className="text-gray-600 mt-2">
          Bayan giyim ürünlerini inceleyebilir, kıyafet, ayakkabı ve aksesuar seçeneklerini keşfedebilirsiniz.
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
