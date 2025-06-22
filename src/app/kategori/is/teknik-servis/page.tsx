"use client"

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Wrench, Star, Heart, Users, Zap, Award, Clock, MapPin, Zap as Lightning, Droplets, Snowflake, Home } from 'lucide-react'

export default function TeknikServisPage() {
  const [category, setCategory] = useState<any>(null)
  const [subcategory, setSubcategory] = useState<any>(null)
  const [mappedListings, setMappedListings] = useState<Listing[]>([])

  useEffect(() => {
    const foundCategory = categories.find((cat) => cat.slug === 'is')
    if (!foundCategory) return
    setCategory(foundCategory)
    
    const foundSubcategory = foundCategory.subcategories?.find((sub) => sub.slug === 'teknik-servis')
    if (!foundSubcategory) return
    setSubcategory(foundSubcategory)

    // Listings data'sını doğru formata dönüştür
    const mapped = rawListings
      .filter(listing => 
        (listing.category.toLowerCase() === 'iş' || listing.category.toLowerCase() === 'is') && 
        (listing.subCategory?.toLowerCase() ?? '') === 'teknik servis'
      )
      
    
    setMappedListings(mapped)
  }, [])

  if (!category || !subcategory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Teknik Servis</h1>
        <p className="mb-4">Teknik servis hizmetleriyle ilgili ilanlar burada listelenir.</p>
        <Link href="/kategori/is" className="text-blue-600 hover:underline">İş Kategorisine Dön</Link>
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
              <Wrench className="w-5 h-5 text-blue-500 mr-2" />
              Teknik Servis Alanları
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Lightning className="w-4 h-4 text-yellow-500 mr-2" />
                Elektrik
              </li>
              <li className="flex items-center">
                <Droplets className="w-4 h-4 text-blue-500 mr-2" />
                Su Tesisatı
              </li>
              <li className="flex items-center">
                <Snowflake className="w-4 h-4 text-cyan-500 mr-2" />
                Klima
              </li>
              <li className="flex items-center">
                <Home className="w-4 h-4 text-gray-500 mr-2" />
                Beyaz Eşya
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Teknik Servis Avantajları
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Heart className="w-4 h-4 text-red-500 mr-2" />
                Garantili Hizmet
              </li>
              <li className="flex items-center">
                <Users className="w-4 h-4 text-blue-500 mr-2" />
                Uzman Teknisyen
              </li>
              <li className="flex items-center">
                <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                Hızlı Müdahale
              </li>
              <li className="flex items-center">
                <Award className="w-4 h-4 text-green-500 mr-2" />
                Kaliteli Parça
              </li>
              <li className="flex items-center">
                <Clock className="w-4 h-4 text-purple-500 mr-2" />
                7/24 Acil Servis
              </li>
              <li className="flex items-center">
                <MapPin className="w-4 h-4 text-red-500 mr-2" />
                Yerinde Servis
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Wrench className="w-8 h-8 text-blue-600 mr-3" />
              {subcategory.name}
            </h1>
            <p className="text-gray-600">
              Uzman teknisyenlerimiz ile elektrik, su tesisatı, klima ve beyaz eşya arızalarınızı hızlı ve güvenilir şekilde çözüyoruz. 
              Garantili hizmet ve kaliteli parça garantisi.
            </p>
          </div>

          {/* Alt Kategoriler Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {subcategory.subcategories?.map((sub: any) => (
              <Link
                key={sub.slug}
                href={`/kategori/is/teknik-servis/${sub.slug}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{sub.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{sub.name}</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Profesyonel {sub.name.toLowerCase()} servisi
                </p>
              </Link>
            ))}
          </div>

          {/* Featured Ads */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Öne Çıkan Teknik Servis İlanları</h2>
            <FeaturedAds 
              category={category.slug} 
              subcategory={subcategory.slug} 
              listings={mappedListings} 
            />
          </div>

          {/* Latest Ads */}
          <div>
            <h2 className="text-xl font-semibold mb-4">En Yeni Teknik Servis İlanları</h2>
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

