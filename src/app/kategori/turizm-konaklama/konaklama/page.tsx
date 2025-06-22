'use client'

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Hotel, MapPin, Calendar, Star, BedDouble, Building, Home } from 'lucide-react'

export default function KonaklamaPage() {
  const [mappedListings, setMappedListings] = useState<Listing[]>([])
  const [category, setCategory] = useState<any>(null)
  const [subcategory, setSubcategory] = useState<any>(null)
  const [otherSubcategories, setOtherSubcategories] = useState<any[]>([])

  useEffect(() => {
    // Ana kategoriyi bul
    const foundCategory = categories.find((cat) => cat.slug === 'turizm-konaklama')
    if (!foundCategory) return

    // Alt kategoriyi bul
    const foundSubcategory = foundCategory.subcategories?.find((sub) => sub.slug === 'konaklama')
    if (!foundSubcategory) return

    // Diğer alt kategoriler
    const otherSubs = foundCategory.subcategories?.filter((sub) => sub.slug !== 'konaklama') || []

    setCategory(foundCategory)
    setSubcategory(foundSubcategory)
    setOtherSubcategories(otherSubs)

    // Listings data'sını doğru formata dönüştür
    const mapped = rawListings
      .filter(listing => 
        listing.category.toLowerCase() === 'turizm-konaklama' && 
        (listing.subCategory?.toLowerCase() ?? '') === 'konaklama'
      )
      
    
    setMappedListings(mapped)
  }, [])

  if (!category || !subcategory) {
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

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      '🏨': <Hotel className="w-6 h-6 text-blue-500" />,
      '🏠': <Home className="w-6 h-6 text-orange-500" />,
      '🏢': <Building className="w-6 h-6 text-gray-600" />,
      '🏖️': <div className="w-6 h-6 text-yellow-500 text-xl">🏖️</div>,
      '🏰': <div className="w-6 h-6 text-purple-500 text-xl">🏰</div>,
    }
    return iconMap[iconName] || <div className="w-6 h-6 text-gray-500 text-xl">{iconName}</div>
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
              Ana Sayfa
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/kategori/turizm-konaklama" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                {category.name}
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500">{subcategory.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Hotel className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subcategory.name}</h1>
            <p className="text-gray-600">En iyi konaklama seçenekleri</p>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="font-semibold text-lg mb-4 text-gray-900">Alt Kategoriler</h2>
            <ul className="space-y-3">
              {subcategory.subcategories?.map((subsub: any) => (
                <li key={subsub.slug}>
                  <Link 
                    href={`/kategori/turizm-konaklama/konaklama/${subsub.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex-shrink-0">
                      {getIconComponent(subsub.icon)}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {subsub.name}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Diğer Kategoriler */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Diğer Kategoriler</h3>
            <ul className="space-y-2">
              {otherSubcategories.map((sub: any) => (
                <li key={sub.slug}>
                  <Link 
                    href={`/kategori/turizm-konaklama/${sub.slug}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <div className="w-4 h-4 text-gray-400">
                      {getIconComponent(sub.icon)}
                    </div>
                    <span className="text-sm">{sub.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İstatistikler */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">İstatistikler</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Toplam İlan</span>
                <span className="font-semibold text-blue-600">{mappedListings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Premium İlan</span>
                <span className="font-semibold text-yellow-600">
                  {mappedListings.filter(l => l.isPremium).length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Ana İçerik */}
        <main className="flex-1">
          {/* Öne Çıkan İlanlar */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Öne Çıkan İlanlar</h2>
            </div>
            <FeaturedAds 
              category="turizm-konaklama" 
              subcategory="konaklama"
              listings={mappedListings.filter(l => l.isPremium)} 
            />
          </section>

          {/* En Yeni İlanlar */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">En Yeni İlanlar</h2>
            </div>
            <LatestAds 
              category="turizm-konaklama" 
              subcategory="konaklama"
              listings={mappedListings} 
            />
          </section>
        </main>
      </div>
    </div>
  )
} 

