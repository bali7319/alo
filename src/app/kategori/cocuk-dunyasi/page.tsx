"use client"

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Baby, Shirt, BedDouble, Footprints, Trophy, BookOpen, Bike, Music, Star, Heart, Users, Zap, Award, Clock, MapPin } from 'lucide-react'

export default function CocukDunyasiPage() {
  const [category, setCategory] = useState<any>(null)
  const [mappedListings, setMappedListings] = useState<Listing[]>([])

  useEffect(() => {
    const foundCategory = categories.find((cat) => cat.slug === 'cocuk-dunyasi')
    if (!foundCategory) return
    setCategory(foundCategory)

    // Debug: Tüm ilanları kontrol et
    console.log('Toplam ilan sayısı:', rawListings.length)
    
    // Çocuk Dünyası ilanlarını filtrele
    const filtered = rawListings.filter(listing => {
      const categoryLower = listing.category.toLowerCase()
      return categoryLower === 'çocuk dünyası' || 
             categoryLower === 'cocuk dunyasi' ||
             categoryLower.includes('çocuk') ||
             categoryLower.includes('cocuk')
    })
    
    console.log('Filtrelenmiş ilan sayısı:', filtered.length)
    console.log('Filtrelenmiş ilanlar:', filtered.map(l => ({ category: l.category, title: l.title })))

    const cocukDunyasiListings: Listing[] = filtered
    
    console.log('Dönüştürülmüş ilan sayısı:', cocukDunyasiListings.length)
    setMappedListings(cocukDunyasiListings)
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
              <Baby className="w-5 h-5 text-pink-500 mr-2" />
              Çocuk Kategorileri
            </h2>
            <ul className="space-y-2">
              {category.subcategories?.map((sub: any) => (
                <li key={sub.slug}>
                  <Link 
                    href={`/kategori/${category.slug}/${sub.slug}`}
                    className="flex items-center text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    <span className="mr-2">{sub.icon}</span>
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h3 className="font-semibold mb-3">Çocuk Ürünleri Özellikleri</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  Güvenli Malzeme
                </li>
                <li className="flex items-center">
                  <Heart className="w-4 h-4 text-red-500 mr-2" />
                  Sağlıklı Ürünler
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 text-blue-500 mr-2" />
                  Tüm Yaş Grupları
                </li>
                <li className="flex items-center">
                  <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                  Hızlı Teslimat
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-green-500 mr-2" />
                  Garantili Ürün
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
              {category.name} Ürünleri
            </h1>
            <p className="text-gray-600">
              Çocuklarınız için güvenli, sağlıklı ve eğlenceli ürünler. Giyim, oyuncak, oda mobilyaları ve daha fazlası.
            </p>
            {/* Debug bilgisi */}
            <p className="text-sm text-gray-500 mt-2">
              Toplam {mappedListings.length} ilan bulundu
            </p>
          </div>

          {/* Featured Ads */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Öne Çıkan Çocuk Ürünleri</h2>
            <FeaturedAds 
              category={category.slug} 
              listings={mappedListings} 
            />
          </div>

          {/* Latest Ads */}
          <div>
            <h2 className="text-xl font-semibold mb-4">En Yeni Çocuk Ürünleri</h2>
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

