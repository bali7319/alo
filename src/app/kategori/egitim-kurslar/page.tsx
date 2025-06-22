'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { FaGraduationCap, FaBook, FaChalkboardTeacher, FaLanguage, FaMusic, FaDumbbell, FaPalette, FaCamera, FaGamepad } from 'react-icons/fa'

export default function EgitimKurslarPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState<any>(null)
  const [mappedListings, setMappedListings] = useState<Listing[]>([])
  
  useEffect(() => {
    // Eğitim-kurslar kategorisini bul
    const foundCategory = categories.find(cat => cat.slug === 'egitim-kurslar')
    
    if (foundCategory) {
      setCategory(foundCategory)
      
      // Listings data'sını doğru formata dönüştür
      const mapped = rawListings
        .filter(listing => listing.category.toLowerCase() === 'egitim-kurslar')
        
      
      setMappedListings(mapped)
    }
    
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

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

  // Alt kategori ikonları
  const subcategoryIcons: { [key: string]: any } = {
    'yabanci-dil': <FaLanguage className="w-5 h-5 text-blue-500" />,
    'muzik': <FaMusic className="w-5 h-5 text-purple-500" />,
    'spor': <FaDumbbell className="w-5 h-5 text-green-500" />,
    'sanat': <FaPalette className="w-5 h-5 text-pink-500" />,
    'fotograf': <FaCamera className="w-5 h-5 text-indigo-500" />,
    'oyun': <FaGamepad className="w-5 h-5 text-red-500" />,
    'universite': <FaGraduationCap className="w-5 h-5 text-yellow-500" />,
    'kurs': <FaBook className="w-5 h-5 text-teal-500" />,
    'ozel-ders': <FaChalkboardTeacher className="w-5 h-5 text-orange-500" />,
    'dil-egitimi': <FaLanguage className="w-5 h-5 text-cyan-500" />,
    'okul-kres': <FaGraduationCap className="w-5 h-5 text-emerald-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Eğitim & Kurslar</span>
        </nav>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Alt Kategoriler</h2>
              <ul className="space-y-2">
                {category.subcategories?.map((subcategory: any) => (
                  <li key={subcategory.slug}>
                    <Link 
                      href={`/kategori/egitim-kurslar/${subcategory.slug}`}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-600">
                        {subcategoryIcons[subcategory.slug] || <FaBook className="w-5 h-5" />}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{subcategory.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Ana İçerik */}
          <div className="flex-1">
            {/* İlanlar */}
            <div className="space-y-8">
              <FeaturedAds 
                category={category.slug}
                title="Öne Çıkan İlanlar"
                listings={mappedListings}
              />
              
              <LatestAds 
                category={category.slug}
                title="En Son İlanlar"
                listings={mappedListings}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 

