"use client"

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'

export default function MasaSandalyePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState<any>(null)
  const [subcategory, setSubcategory] = useState<any>(null)
  const [subSubcategory, setSubSubcategory] = useState<any>(null)
  const [mappedListings, setMappedListings] = useState<Listing[]>([])

  useEffect(() => {
    // Ev & Bahçe kategorisini bul
    const foundCategory = categories.find(cat => cat.slug === 'ev-ve-bahce')
    if (!foundCategory) return
    setCategory(foundCategory)
    
    const foundSubcategory = foundCategory.subcategories?.find((sub) => sub.slug === 'mobilya')
    if (!foundSubcategory) return
    setSubcategory(foundSubcategory)

    const foundSubSubcategory = foundSubcategory.subcategories?.find((subsub) => subsub.slug === 'masa-sandalye')
    if (!foundSubSubcategory) return
    setSubSubcategory(foundSubSubcategory)

    // Listings data'sını doğru formata dönüştür
    const mapped = rawListings
      .filter(listing => 
        listing.category.toLowerCase() === 'ev-ve-bahce' && 
        (listing.subCategory?.toLowerCase() ?? '') === 'mobilya' &&
        listing.subSubCategory?.toLowerCase() === 'masa-sandalye'
      )
      
    
    setMappedListings(mapped)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!category || !subcategory || !subSubcategory) {
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
    'koltuk': 'text-amber-500',
    'yatak-odasi': 'text-blue-500',
    'masa-sandalye': 'text-orange-500',
    'dolap': 'text-green-500',
    'sehpa': 'text-emerald-500',
    'gardrop': 'text-purple-500',
    'kitaplik': 'text-pink-500',
    'tv-unitesi': 'text-yellow-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-blue-600 flex items-center">
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
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href={`/kategori/${category.slug}/${subcategory.slug}`} className="text-gray-700 hover:text-blue-600">
                  {subcategory.name}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{subSubcategory.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="flex gap-8">
          {/* Sol Sidebar - Sabit Genişlik */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="font-semibold text-lg mb-4">Alt Kategoriler</h2>
              <ul className="space-y-2">
                {subcategory.subcategories?.map((subsub: any) => (
                  <li key={subsub.slug}>
                    <Link 
                      href={`/kategori/${category.slug}/${subcategory.slug}/${subsub.slug}`}
                      className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                        subsub.slug === 'masa-sandalye' ? 'bg-orange-50 text-orange-700' : ''
                      }`}
                    >
                      <span className={`text-lg ${subcategoryColors[subsub.slug] || 'text-gray-500'}`}>
                        {subsub.icon}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{subsub.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Orta Ana İçerik - Esnek Genişlik */}
          <main className="flex-1 min-w-0">
            {/* İlanlar */}
            <div className="space-y-8">
              <FeaturedAds 
                category={category.slug}
                subcategory={subcategory.slug}
                title="Öne Çıkan İlanlar"
                listings={mappedListings}
              />
              
              <LatestAds 
                category={category.slug}
                subcategory={subcategory.slug}
                title="En Son İlanlar"
                listings={mappedListings}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
} 

