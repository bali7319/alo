'use client'

import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'

// Hobi & Sanat kategorisi tanımı
const hobiSanatCategory = {
  name: "Sanat & Hobi",
  slug: "sanat-hobi",
  icon: "🎨",
  subcategories: [
    {
      name: "Resim",
      slug: "resim",
      icon: "🎨"
    },
    {
      name: "Müzik",
      slug: "muzik",
      icon: "🎵"
    },
    {
      name: "Seramik",
      slug: "seramik",
      icon: "🏺"
    },
    {
      name: "Fotoğrafçılık",
      slug: "fotografcilik",
      icon: "📸"
    },
    {
      name: "El Sanatları",
      slug: "el-sanatlari",
      icon: "🧶"
    },
    {
      name: "Koleksiyon",
      slug: "koleksiyon",
      icon: "📦"
    },
    {
      name: "Diğer",
      slug: "diger",
      icon: "🎭"
    }
  ]
}

export default function HobiSanatPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [mappedListings, setMappedListings] = useState<Listing[]>([])
  
  useEffect(() => {
    // Hobi & Sanat ilanlarını filtrele ve dönüştür
    const mapped = rawListings
      .filter(listing => listing.category.toLowerCase() === 'hobi-sanat' || listing.category.toLowerCase() === 'sanat-hobi')
      
    
    setMappedListings(mapped)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb Navigation */}
      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex space-x-2">
          <li>
            <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
          </li>
          <li>/</li>
          <li className="text-gray-900">{hobiSanatCategory.name}</li>
        </ol>
      </nav>

      <div className="flex gap-8">
        {/* Sidebar - Alt Kategoriler */}
        <aside className="w-64">
          <h2 className="font-semibold mb-4 text-lg">Alt Kategoriler</h2>
          <ul className="space-y-2">
            {hobiSanatCategory.subcategories.map((sub) => (
              <li key={sub.slug}>
                <Link 
                  href={`/kategori/hobi-sanat/${sub.slug}`}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <span className="text-lg">{sub.icon}</span>
                  <span>{sub.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-6">{hobiSanatCategory.name}</h1>
          
          <FeaturedAds category="hobi-sanat" listings={mappedListings} />
          <LatestAds category="hobi-sanat" listings={mappedListings} />
        </main>
      </div>
    </div>
  )
} 

