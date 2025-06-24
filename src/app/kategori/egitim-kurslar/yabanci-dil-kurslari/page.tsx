'use client'

import { useParams } from 'next/navigation'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { useState } from 'react'

export default function YabanciDilKurslariPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string | null>(null)
  const [features, setFeatures] = useState<string[]>([])
  // const location = useParams().location

  // Yabancı dil kursları ilanlarını filtrele
  const yabanciDilKurslari = listings.filter(listing =>
    listing.category === 'egitim-kurslar' &&
    listing.subCategory === 'yabanci-dil-kurslari'
  )

  // Filtreleme fonksiyonu
  const filteredListings = yabanciDilKurslari.filter(listing => {
    if (priceRange) {
      const price = listing.price;
      const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
      switch (priceRange) {
        case '0-2000':
          if (numericPrice > 2000) return false;
          break;
        case '2000-5000':
          if (numericPrice < 2000 || numericPrice > 5000) return false;
          break;
        case '5000-10000':
          if (numericPrice < 5000 || numericPrice > 10000) return false;
          break;
        case '10000+':
          if (numericPrice < 10000) return false;
          break;
      }
    }
    return true;
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Yabancı Dil Kursları</h1>
        <p className="text-gray-600 mt-2">
          İngilizce, Almanca, Fransızca ve daha birçok dil kursunu inceleyebilirsiniz.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Alt Kategoriler + Filtreler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            {/* Alt Kategoriler */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Alt Kategoriler</h2>
              <ul className="space-y-2">
                <li>
                  <a href="/kategori/egitim-kurslar/yabanci-dil/ingilizce" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">🇬🇧</span> İngilizce
                  </a>
                </li>
                <li>
                  <a href="/kategori/egitim-kurslar/yabanci-dil/almanca" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">🇩🇪</span> Almanca
                  </a>
                </li>
                <li>
                  <a href="/kategori/egitim-kurslar/yabanci-dil/fransizca" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">🇫🇷</span> Fransızca
                  </a>
                </li>
                <li>
                  <a href="/kategori/egitim-kurslar/yabanci-dil/ispanyolca" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">🇪🇸</span> İspanyolca
                  </a>
                </li>
                <li>
                  <a href="/kategori/egitim-kurslar/yabanci-dil/arapca" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">🇸🇦</span> Arapça
                  </a>
                </li>
              </ul>
            </div>
            {/* Filtreler */}
            <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
            
            {/* Fiyat Aralığı Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Fiyat Aralığı</h3>
              <div className="space-y-2">
                {[
                  { value: '0-2000', label: '0 - 2.000 TL' },
                  { value: '2000-5000', label: '2.000 - 5.000 TL' },
                  { value: '5000-10000', label: '5.000 - 10.000 TL' },
                  { value: '10000+', label: '10.000 TL ve üzeri' }
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
