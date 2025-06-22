'use client'

import { useParams } from 'next/navigation'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { useState } from 'react'

export default function SportsCoursesCategoryPage() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [courseType, setCourseType] = useState<string | null>(null)

  // Spor kursu ilanlarını filtrele
  const sportsCourseListings = listings.filter(listing =>
    listing.category === 'egitim-kurslar' &&
    listing.subCategory === 'spor-kurslari'
  )

  // Spor dallarını topla
  // const sportsTypes = []

  // Filtreleme fonksiyonu
  const filteredListings = sportsCourseListings.filter(listing => {
    // if (selectedSportType && listing.brand !== selectedSportType) return false
    if (location && listing.location !== location) return false
    // if (courseType && !listing.features.includes(courseType)) return false
    if (priceRange) {
      const price = listing.price;
      switch (priceRange) {
        case '0-2000':
          if (price > 2000) return false;
          break;
        case '2000-5000':
          if (price < 2000 || price > 5000) return false;
          break;
        case '5000-10000':
          if (price < 5000 || price > 10000) return false;
          break;
        case '10000+':
          if (price < 10000) return false;
          break;
      }
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Spor Kursları</h1>
        <p className="text-gray-600 mt-2">
          Yüzme, tenis, fitness ve daha birçok spor dalı için kursları inceleyebilirsiniz.
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
                  <a href="/kategori/egitim-kurslar/spor/fitness-kursu" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">💪</span> Fitness
                  </a>
                </li>
                <li>
                  <a href="/kategori/egitim-kurslar/spor/yoga-kursu" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">🧘</span> Yoga
                  </a>
                </li>
                <li>
                  <a href="/kategori/egitim-kurslar/spor/yuzme-kursu" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">🏊</span> Yüzme
                  </a>
                </li>
                <li>
                  <a href="/kategori/egitim-kurslar/spor/tenis-kursu" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">🎾</span> Tenis
                  </a>
                </li>
              </ul>
            </div>
            {/* Filtreler */}
            <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
            
            {/* Spor Dalı Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Spor Dalı</h3>
              <div className="space-y-2">
                {['Yüzme', 'Tenis', 'Fitness', 'Yoga'].map(sport => (
                  <label key={sport} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedSport === sport}
                      onChange={() => setSelectedSport(selectedSport === sport ? null : sport)}
                    />
                    <span>{sport}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Kurs Tipi Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Kurs Tipi</h3>
              <div className="space-y-2">
                {[
                  'Birebir Ders',
                  'Grup Dersi',
                  'Online Kurs',
                  'Yoğun Program',
                  'Çocuklar İçin',
                  'Yetişkinler İçin',
                  'Profesyonel Eğitim'
                ].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={courseType === type}
                      onChange={() => setCourseType(courseType === type ? null : type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Konum Filtresi */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Konum</h3>
              <div className="space-y-2">
                {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'].map(city => (
                  <label key={city} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={location === city}
                      onChange={() => setLocation(location === city ? null : city)}
                    />
                    <span>{city}</span>
                  </label>
                ))}
              </div>
            </div>

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

