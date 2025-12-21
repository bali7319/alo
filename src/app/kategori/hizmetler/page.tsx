"use client"

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Wrench, Sparkles, Truck, Shield, Palette, Star, Users, Zap, Award, Clock, MapPin } from 'lucide-react'

export default function HizmetlerPage() {
  const [category, setCategory] = useState<any>(null)
  const [mappedListings, setMappedListings] = useState<Listing[]>([])

  useEffect(() => {
    const foundCategory = categories.find((cat) => cat.slug === 'hizmetler')
    if (!foundCategory) return
    setCategory(foundCategory)

    // Listings data'sını doğru formata dönüştür
    const mapped = rawListings
      .filter(listing => listing.category.toLowerCase() === 'hizmetler')
      
    
    setMappedListings(mapped)
  }, [])

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

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Ana Sayfa
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">{category.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Wrench className="w-5 h-5 text-blue-500 mr-2" />
              Hizmet Kategorileri
            </h2>
            <ul className="space-y-2">
              {category.subcategories?.map((sub: any) => (
                <li key={sub.slug}>
                  <Link 
                    href={`/kategori/${category.slug}/${sub.slug}`}
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span className="mr-2">{sub.icon}</span>
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.name}
            </h1>
            <p className="text-gray-600">
              Profesyonel hizmet sağlayıcıları ile ihtiyaçlarınızı karşılayın. Temizlik, nakliyat, güvenlik ve tasarım hizmetleri.
            </p>
          </div>

          {/* Featured Ads */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Öne Çıkan Hizmetler</h2>
            <FeaturedAds 
              category={category.slug} 
              listings={mappedListings} 
            />
          </div>

          {/* Latest Ads */}
          <div>
            <h2 className="text-xl font-semibold mb-4">En Yeni Hizmetler</h2>
            <LatestAds 
              category={category.slug} 
              listings={mappedListings} 
            />
          </div>
        </main>
      </div>
    </div>
  )
} 

