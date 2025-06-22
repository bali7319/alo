'use client'

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'

export default function EvVeBahcePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState<any>(null)
  const [mappedListings, setMappedListings] = useState<Listing[]>([])
  
  useEffect(() => {
    // Ev & Bahçe kategorisini bul
    const foundCategory = categories.find(cat => cat.slug === 'ev-ve-bahce')
    
    if (foundCategory) {
      setCategory(foundCategory)
      
      // Listings data'sını doğru formata dönüştür
      const mapped = rawListings
        .filter(listing => listing.category.toLowerCase() === 'ev-ve-bahce')
        
      
      setMappedListings(mapped)
    }
    
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategori bulunamadı</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  // Alt kategori renkleri
  const subcategoryColors: { [key: string]: string } = {
    'mobilya': 'text-amber-500',
    'beyaz-esya': 'text-blue-500',
    'mutfak-gerecleri': 'text-orange-500',
    'bahce-dis-mekan': 'text-green-500',
    'bahce-aletleri': 'text-emerald-500',
    'temizlik': 'text-purple-500',
    'dekorasyon': 'text-pink-500',
    'aydinlatma': 'text-yellow-500',
    'guvenlik': 'text-red-500',
    'diger': 'text-gray-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Ev & Bahçe</span>
        </nav>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Alt Kategoriler</h2>
              <ul className="space-y-2">
                {category.subcategories?.map((subcategory: any) => (
                  <li key={subcategory.slug}>
                    <Link 
                      href={`/kategori/ev-ve-bahce/${subcategory.slug}`}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className={`text-lg ${subcategoryColors[subcategory.slug] || 'text-gray-500'}`}>
                        {subcategory.icon}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{subcategory.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Ana İçerik */}
          <div className="flex-1">
            {/* İlanlar */}
            <div className="space-y-8">
              <FeaturedAds 
                category={category.slug}
                title="Öne Çıkan İlanlar"
                listings={mappedListings}
              />
              
              <LatestAds 
                category={category.slug}
                title="En Son İlanlar"
                listings={mappedListings}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 

