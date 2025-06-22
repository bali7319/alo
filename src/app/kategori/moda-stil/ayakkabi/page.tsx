"use client"

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Footprints, Star, Heart, Users, Zap, Award, Clock, MapPin } from 'lucide-react'

export default function AyakkabiPage() {
  const [category, setCategory] = useState<any>(null)
  const [subcategory, setSubcategory] = useState<any>(null)
  const [mappedListings, setMappedListings] = useState<Listing[]>([])

  useEffect(() => {
    const foundCategory = categories.find((cat) => cat.slug === 'moda-stil')
    if (!foundCategory) return
    setCategory(foundCategory)
    
    const foundSubcategory = foundCategory.subcategories?.find((sub) => sub.slug === 'ayakkabi')
    if (!foundSubcategory) return
    setSubcategory(foundSubcategory)

    // Listings data'sını doğru formata dönüştür
    const mapped = rawListings
      .filter(listing => 
        listing.category.toLowerCase() === 'moda & stil' && 
        (listing.subCategory?.toLowerCase() ?? '') === 'ayakkabi'
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
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Ana Sayfa
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href={`/kategori/${category.slug}`} className="text-gray-700 hover:text-blue-600">
                {category.name}
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">{subcategory.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Footprints className="w-5 h-5 text-orange-500 mr-2" />
              Alt Kategoriler
            </h2>
            <ul className="space-y-2">
              {subcategory.subcategories?.map((subsub: any) => (
                <li key={subsub.slug}>
                  <Link 
                    href={`/kategori/${category.slug}/${subcategory.slug}/${subsub.slug}`}
                    className="flex items-center text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    <span className="mr-2">{subsub.icon}</span>
                    {subsub.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h3 className="font-semibold mb-3">Ayakkabı Özellikleri</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Footprints className="w-4 h-4 text-orange-500 mr-2" />
                  Kaliteli Malzeme
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  Rahat Taban
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 text-blue-500 mr-2" />
                  Tüm Numara
                </li>
                <li className="flex items-center">
                  <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                  Hızlı Teslimat
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-green-500 mr-2" />
                  Garantili Ürünler
                </li>
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-purple-500 mr-2" />
                  7/24 Destek
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 text-red-500 mr-2" />
                  Ücretsiz İade
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {subcategory.name} Ürünleri
            </h1>
            <p className="text-gray-600">
              Şık ve rahat ayakkabı modelleri ile tarzınızı tamamlayın. Erkek, kadın, spor ve çocuk ayakkabıları.
            </p>
          </div>

          {/* Featured Ads */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Öne Çıkan Ayakkabı Ürünleri</h2>
            <FeaturedAds 
              category={category.slug} 
              subcategory={subcategory.slug} 
              listings={mappedListings} 
            />
          </div>

          {/* Latest Ads */}
          <div>
            <h2 className="text-xl font-semibold mb-4">En Yeni Ayakkabı Ürünleri</h2>
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

