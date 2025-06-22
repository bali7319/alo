'use client'

import { useParams } from 'next/navigation'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { useState } from 'react'

export default function AcademicCoursesCategoryPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [courseType, setCourseType] = useState<string | null>(null)

  // Akademik kurs ilanlarını filtrele
  const academicCourseListings = listings.filter(listing => 
    listing.category === 'egitim-kurslar' && 
    listing.subCategory === 'akademik-kurslar'
  )

  // Ders konularını topla (title'dan çıkar)
  const subjects = Array.from(new Set(academicCourseListings.map(listing => {
    const title = listing.title.toLowerCase()
    if (title.includes('matematik')) return 'Matematik'
    if (title.includes('fizik')) return 'Fizik'
    if (title.includes('kimya')) return 'Kimya'
    if (title.includes('biyoloji')) return 'Biyoloji'
    return 'Diğer'
  })))

  // Filtreleme fonksiyonu
  const filteredListings = academicCourseListings.filter(listing => {
    if (selectedSubject) {
      const title = listing.title.toLowerCase()
      if (selectedSubject === 'Matematik' && !title.includes('matematik')) return false
      if (selectedSubject === 'Fizik' && !title.includes('fizik')) return false
      if (selectedSubject === 'Kimya' && !title.includes('kimya')) return false
      if (selectedSubject === 'Biyoloji' && !title.includes('biyoloji')) return false
    }
    if (location && listing.location !== location) return false
    if (priceRange) {
      const price = listing.price
      switch (priceRange) {
        case '0-2000':
          if (price > 2000) return false
          break
        case '2000-5000':
          if (price < 2000 || price > 5000) return false
          break
        case '5000-10000':
          if (price < 5000 || price > 10000) return false
          break
        case '10000+':
          if (price < 10000) return false
          break
      }
    }
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Akademik Kurslar</h1>
        <p className="text-gray-600 mt-2">
          Matematik, fizik, kimya ve diğer akademik dersler için özel kursları inceleyebilirsiniz.
        </p>
      </div>
      
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Alt Kategoriler */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Alt Kategoriler</h2>
              <ul className="space-y-2">
                <li>
                  <a href="/kategori/egitim-kurslar/akademik/matematik" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">📐</span> Matematik
                  </a>
                </li>
                <li>
                  <a href="/kategori/egitim-kurslar/akademik/fizik" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">⚡</span> Fizik
                  </a>
                </li>
                <li>
                  <a href="/kategori/egitim-kurslar/akademik/kimya" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">🧪</span> Kimya
                  </a>
                </li>
                <li>
                  <a href="/kategori/egitim-kurslar/akademik/biyoloji" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="mr-2">🧬</span> Biyoloji
                  </a>
                </li>
              </ul>
            </div>
            {/* Sidebar devamı */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
              
              {/* Ders Konusu Filtresi */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Ders Konusu</h3>
                <div className="space-y-2">
                  {subjects.map(subject => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedSubject === subject}
                        onChange={() => setSelectedSubject(selectedSubject === subject ? null : subject)}
                      />
                      <span>{subject}</span>
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
        </aside>

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
