'use client'

import { FaFutbol, FaGamepad, FaDice, FaCampground, FaTicketAlt } from 'react-icons/fa'
import { useState } from 'react'
import { listings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import Link from 'next/link'
import { Listing } from '@/types/listings'

const categories = [
  {
    id: 'spor-aktiviteleri',
    name: 'Spor Aktiviteleri',
    icon: <FaFutbol className="inline mr-2 text-green-500" />
  },
  {
    id: 'video-oyunlari',
    name: 'Video Oyunları',
    icon: <FaGamepad className="inline mr-2 text-blue-500" />
  },
  {
    id: 'masa-oyunlari',
    name: 'Masa & Zeka Oyunları',
    icon: <FaDice className="inline mr-2 text-purple-500" />
  },
  {
    id: 'hobi-aktiviteleri',
    name: 'Hobi ve Eğlence Aktiviteleri',
    icon: <FaCampground className="inline mr-2 text-orange-500" />
  },
  {
    id: 'etkinlikler',
    name: 'Etkinlik & Sosyal Aktiviteler',
    icon: <FaTicketAlt className="inline mr-2 text-red-500" />
  }
]

export default function SporlarOyunlarEglencelerPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string | null>(null)

  // Sporlar, oyunlar ve eğlenceler ilanlarını filtrele
  const sporlarOyunlarEglencelerListings: Listing[] = listings
    .filter(listing => listing.category === 'sporlar-oyunlar-eglenceler')
    

  // Filtreleme fonksiyonu
  const filteredListings = sporlarOyunlarEglencelerListings.filter(listing => {
    if (selectedCategory && listing.subCategory !== selectedCategory) return false
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
        <h1 className="text-3xl font-bold text-gray-900">Sporlar, Oyunlar ve Eğlenceler</h1>
        <p className="text-gray-600 mt-2">
          Spor ekipmanları, oyunlar ve eğlence aktiviteleri için ilanları keşfedin
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Sidebar - Kategoriler */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Kategoriler</h2>
            
            {/* Ana Kategoriler */}
            <div className="space-y-4">
              {categories.map(category => (
                <Link 
                  key={category.id}
                  href={`/kategori/sporlar-oyunlar-eglenceler/${category.id}`}
                  className="flex items-center text-gray-700 hover:text-blue-600 font-medium p-2 rounded-lg hover:bg-gray-50"
                >
                  {category.icon}
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>

            <div className="border-t pt-4 mt-6">
              <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
              
            </div>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="flex-1">
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

