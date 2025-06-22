"use client"

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { FaBriefcase, FaSprayCan, FaTools, FaTruck, FaLock, FaPalette, FaGraduationCap } from 'react-icons/fa'

export default function IsPage() {
  const [category, setCategory] = useState<any>(null)
  const [mappedListings, setMappedListings] = useState<Listing[]>([])

  useEffect(() => {
    const foundCategory = categories.find((cat) => cat.slug === 'is')
    if (!foundCategory) return
    setCategory(foundCategory)

    console.log('Raw listings count:', rawListings.length)
    console.log('Sample raw listing:', rawListings[0])
    
    // Listings data'sını doğru formata dönüştür
    const filtered = rawListings.filter(listing => {
      // Basit string karşılaştırması
      const matches = listing.category === 'İş'
      console.log(`Listing ${listing.id}: category="${listing.category}" matches=${matches}`)
      return matches
    })
    
    console.log('Filtered listings count:', filtered.length)
    
    const mapped = filtered
    
    console.log('Mapped listings count:', mapped.length)
    console.log('Sample mapped listing:', mapped[0])
    
    setMappedListings(mapped)
  }, [])

  // Alt kategori ikonları
  const getSubcategoryIcon = (subcategory: any) => {
    const iconMap: { [key: string]: any } = {
      'garson-komi': <FaBriefcase className="w-5 h-5 text-blue-500" />,
      'sofor-kurye': <FaTruck className="w-5 h-5 text-orange-500" />,
      'temizlik-personeli': <FaSprayCan className="w-5 h-5 text-green-500" />,
      'satis-danismani': <FaBriefcase className="w-5 h-5 text-purple-500" />,
      'guvenlik-gorevlisi': <FaLock className="w-5 h-5 text-red-500" />,
      'sekreter-ofis-elemani': <FaBriefcase className="w-5 h-5 text-indigo-500" />,
      'cagri-merkezi-elemani': <FaBriefcase className="w-5 h-5 text-pink-500" />,
      'insaat-ustasi-iscisi': <FaTools className="w-5 h-5 text-yellow-500" />,
      'ogretmen-egitmen': <FaGraduationCap className="w-5 h-5 text-teal-500" />,
      'saglik-personeli': <FaBriefcase className="w-5 h-5 text-red-400" />,
      'yazilim-bilisim-uzmani': <FaBriefcase className="w-5 h-5 text-blue-600" />,
      'muhasebeci-finans-elemani': <FaBriefcase className="w-5 h-5 text-green-600" />,
      'tekniker-muhendis': <FaTools className="w-5 h-5 text-gray-600" />,
      'pazarlama-reklam-uzmani': <FaPalette className="w-5 h-5 text-purple-600" />,
      'teknik-servis': <FaTools className="w-5 h-5 text-blue-500" />,
      'nakliyat': <FaTruck className="w-5 h-5 text-orange-500" />,
      'guvenlik': <FaLock className="w-5 h-5 text-red-500" />,
      'grafik-tasarim': <FaPalette className="w-5 h-5 text-purple-500" />,
      'egitim': <FaGraduationCap className="w-5 h-5 text-yellow-500" />
    }
    
    return iconMap[subcategory.slug] || <FaBriefcase className="w-5 h-5 text-gray-500" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-900 font-medium">{category.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sol Sidebar - Alt Kategoriler */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {category.name} Alt Kategorileri
              </h3>
              <nav className="space-y-2">
                {category.subcategories?.map((sub: any) => (
                  <Link
                    key={sub.slug}
                    href={`/kategori/${category.slug}/${sub.slug}`}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <span className="text-lg">{getSubcategoryIcon(sub)}</span>
                    <span>{sub.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Ana İçerik */}
          <div className="flex-1">
            {/* Başlık */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <FaBriefcase className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  {category.name}
                </h1>
              </div>
              <p className="text-gray-600">
                Profesyonel iş hizmetleri, teknik servis, temizlik, nakliyat ve daha fazlası. 
                Güvenilir ve kaliteli hizmet için doğru adrestesiniz.
              </p>
            </div>

            {/* İlanlar */}
            <div className="space-y-8">
              <FeaturedAds 
                category="İş"
                title="Öne Çıkan İlanlar"
                listings={mappedListings}
              />
              
              <LatestAds 
                category="İş"
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

