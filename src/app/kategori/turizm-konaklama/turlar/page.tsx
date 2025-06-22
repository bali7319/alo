"use client"

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Ship, Globe, Calendar, Star, MapPin, Users } from 'lucide-react'

export default function TurlarPage() {
  const [category, setCategory] = useState<any>(null)
  const [subcategory, setSubcategory] = useState<any>(null)
  const [mappedListings, setMappedListings] = useState<Listing[]>([])

  useEffect(() => {
    const foundCategory = categories.find((cat) => cat.slug === 'turizm-konaklama')
    if (!foundCategory) return
    setCategory(foundCategory)
    
    const foundSubcategory = foundCategory.subcategories?.find((sub: any) => sub.slug === 'turlar')
    if (!foundSubcategory) return
    setSubcategory(foundSubcategory)
    
    const mapped = rawListings
      .filter(listing => listing.category.toLowerCase() === 'turizm-konaklama' && (listing.subCategory?.toLowerCase() ?? '') === 'turlar')
      
    setMappedListings(mapped)
  }, [])

  if (!category || !subcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategori bulunamadı</h1>
          <Link href="/kategori/turizm-konaklama" className="text-blue-600 hover:text-blue-800">
            Turizm & Konaklama'ya dön
          </Link>
        </div>
      </div>
    )
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      '🚢': <Ship className="w-6 h-6 text-blue-600" />,
      '🌍': <Globe className="w-6 h-6 text-green-500" />,
      '🗺️': <MapPin className="w-6 h-6 text-red-500" />,
      '👥': <Users className="w-6 h-6 text-purple-500" />,
    }
    return iconMap[iconName] || <div className="w-6 h-6 text-gray-500 text-xl">{iconName}</div>
  }

  return (
    <div className="container mx-auto py-8 px-2 md:px-0">
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
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow">
            <Ship className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subcategory.name}</h1>
            <p className="text-gray-600 max-w-xl">En güzel destinasyonlara unutulmaz turlar ve seyahat deneyimleri.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 mb-8 md:mb-0">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="font-semibold text-lg mb-4 text-gray-900">Alt Kategoriler</h2>
            <ul className="space-y-3">
              {subcategory.subcategories?.map((subsub: any) => (
                <li key={subsub.slug}>
                  <Link 
                    href={`/kategori/turizm-konaklama/turlar/${subsub.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-blue-50 group"
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

          {/* Tur Özellikleri */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
            <h2 className="font-semibold text-lg mb-4 text-gray-900">Tur Özellikleri</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-blue-500" />
                <span>Gemi Turları</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-500" />
                <span>Yurt Dışı Turları</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>Yurt İçi Turları</span>
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span>Grup Turları</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Ana İçerik */}
        <main className="flex-1">
          {/* Öne Çıkan İlanlar */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Öne Çıkan Turlar</h2>
            </div>
            <FeaturedAds 
              category="turizm-konaklama" 
              subcategory="turlar"
              listings={mappedListings.filter(l => l.isPremium)} 
            />
          </section>

          {/* En Yeni İlanlar */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">En Yeni Turlar</h2>
            </div>
            <LatestAds 
              category="turizm-konaklama" 
              subcategory="turlar"
              listings={mappedListings} 
            />
          </section>
        </main>
      </div>
    </div>
  )
} 

