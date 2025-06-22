'use client'

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Home, Sparkles, Star, MapPin, Users, Clock, Shield, Award } from 'lucide-react'

export default function SubCategoryPage({ params }: { params: Promise<{ slug: string; subSlug: string }> }) {
  const [mappedListings, setMappedListings] = useState<Listing[]>([])
  const [category, setCategory] = useState<any>(null)
  const [subcategory, setSubcategory] = useState<any>(null)
  const [otherSubcategories, setOtherSubcategories] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      const { slug, subSlug } = await params;

      // Ana kategoriyi bul
      const foundCategory = categories.find((cat) => cat.slug === slug)
      if (!foundCategory) return

      // Alt kategoriyi bul
      const foundSubcategory = foundCategory.subcategories?.find((sub) => sub.slug === subSlug)
      if (!foundSubcategory) return

      // Diğer alt kategoriler
      const otherSubs = foundCategory.subcategories?.filter((sub) => sub.slug !== subSlug) || []

      setCategory(foundCategory)
      setSubcategory(foundSubcategory)
      setOtherSubcategories(otherSubs)

      // Listings data'sını filtrele
      const filtered = rawListings.filter(listing => 
        listing.category.toLowerCase() === slug.toLowerCase() && 
        listing.subCategory?.toLowerCase() === subSlug.toLowerCase()
      )
      
      setMappedListings(filtered)
    })();
  }, [params])

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
            <Link href="/" className="text-gray-700 hover:text-blue-600 flex items-center">
              <Home className="w-4 h-4 mr-1" />
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
              <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
              Diğer {category.name} Kategorileri
            </h2>
            <ul className="space-y-2">
              {otherSubcategories.map((sub: any) => (
                <li key={sub.slug}>
                  <Link 
                    href={`/kategori/${category.slug}/${sub.slug}`}
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span className="mr-2 text-lg">{sub.icon}</span>
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h3 className="font-semibold mb-3 flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                Kategori Özellikleri
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Shield className="w-4 h-4 text-green-500 mr-2" />
                  Güvenilir Satıcılar
                </li>
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-2" />
                  Hızlı Teslimat
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 text-purple-500 mr-2" />
                  Geniş Seçenek
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-yellow-500 mr-2" />
                  Kaliteli Ürünler
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 text-red-500 mr-2" />
                  Yerel Satıcılar
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="mr-3 text-2xl">{subcategory.icon}</span>
              {subcategory.name}
            </h1>
            <p className="text-gray-600">
              {subcategory.name} kategorisinde en iyi ürünleri ve hizmetleri keşfedin.
            </p>
          </div>

          {/* Featured Ads */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Öne Çıkan {subcategory.name}
            </h2>
            <FeaturedAds 
              category={category.slug} 
              subcategory={subcategory.slug} 
              listings={mappedListings} 
            />
          </div>

          {/* Latest Ads */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              Son Eklenen {subcategory.name}
            </h2>
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