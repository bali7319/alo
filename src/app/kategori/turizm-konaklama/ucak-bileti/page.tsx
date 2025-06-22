"use client"

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Plane, Globe, Calendar, Star, MapPin, Users } from 'lucide-react'

export default function UcakBiletiPage() {
  const [category, setCategory] = useState<any>(null)
  const [subcategory, setSubcategory] = useState<any>(null)
  const [mappedListings, setMappedListings] = useState<Listing[]>([])

  useEffect(() => {
    const foundCategory = categories.find((cat) => cat.slug === 'turizm-konaklama')
    if (!foundCategory) return
    setCategory(foundCategory)
    
    const foundSubcategory = foundCategory.subcategories?.find((sub) => sub.slug === 'ucak-bileti')
    if (!foundSubcategory) return
    setSubcategory(foundSubcategory)

    // Listings data'sını doğru formata dönüştür
    const mapped = rawListings
      .filter(listing => 
        listing.category.toLowerCase() === 'turizm-konaklama' && 
        (listing.subCategory?.toLowerCase() ?? '') === 'ucak-bileti'
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

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex items-center space-x-2">
          <li><Link href="/" className="hover:text-blue-600">Ana Sayfa</Link></li>
          <li>/</li>
          <li><Link href="/kategoriler" className="hover:text-blue-600">Kategoriler</Link></li>
          <li>/</li>
          <li><Link href={`/kategori/${category.slug}`} className="hover:text-blue-600">{category.name}</Link></li>
          <li>/</li>
          <li className="text-gray-900">{subcategory.name}</li>
        </ol>
      </nav>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center">
              <Plane className="w-5 h-5 mr-2" />
              {subcategory.name}
            </h2>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Alt Kategoriler</h3>
              <ul className="space-y-2">
                {subcategory.subcategories?.map((subsub: any) => (
                  <li key={subsub.slug}>
                    <Link 
                      href={`/kategori/${category.slug}/${subcategory.slug}/${subsub.slug}`}
                      className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <span className="w-4 h-4 mr-2">{subsub.icon}</span>
                      {subsub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Uçak Bileti Özellikleri</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Plane className="w-4 h-4 mr-2 text-blue-500" />
                  Gidiş Dönüş Biletler
                </li>
                <li className="flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-green-500" />
                  Yurt İçi & Yurt Dışı
                </li>
                <li className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                  Esnek Tarih Seçenekleri
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  Premium Havayolları
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-red-500" />
                  Tüm Havaalanları
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-indigo-500" />
                  Grup Rezervasyonları
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{subcategory.name}</h1>
            <p className="text-gray-600">En uygun fiyatlarla uçak bileti seçeneklerini keşfedin</p>
          </div>

          {/* Featured Ads */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Öne Çıkan Uçak Biletleri</h2>
            <FeaturedAds 
              category={category.slug} 
              subcategory={subcategory.slug} 
              listings={mappedListings} 
            />
          </div>

          {/* Latest Ads */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">En Yeni Uçak Biletleri</h2>
            <LatestAds 
              category={category.slug} 
              subcategory={subcategory.slug} 
              listings={mappedListings} 
            />
          </div>
        </main>
      </div>
    </div>
  )
} 

