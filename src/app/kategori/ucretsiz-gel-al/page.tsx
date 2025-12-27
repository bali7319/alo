'use client'

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Gift, Package, Shirt, Book, Sofa, ToyBrick, Star, Calendar } from 'lucide-react'

export default function UcretsizGelAlPage() {
  const [mappedListings, setMappedListings] = useState<Listing[]>([])
  const [category, setCategory] = useState<any>(null)

  useEffect(() => {
    const foundCategory = categories.find((cat) => cat.slug === 'ucretsiz-gel-al')
    if (!foundCategory) return
    setCategory(foundCategory)
    const mapped = rawListings
      .filter(listing => listing.category.toLowerCase() === 'ücretsiz gel al' || listing.category.toLowerCase() === 'ucretsiz gel al')
      
    setMappedListings(mapped)
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

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      '📦': <Package className="w-6 h-6 text-blue-500" />,
      '👕': <Shirt className="w-6 h-6 text-green-500" />,
      '📚': <Book className="w-6 h-6 text-purple-500" />,
      '🪑': <Sofa className="w-6 h-6 text-orange-500" />,
      '🧸': <ToyBrick className="w-6 h-6 text-pink-500" />,
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
              <span className="text-sm font-medium text-gray-500">{category.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-gray-600 max-w-xl">Ücretsiz eşya, mobilya, giyim, kitap ve oyuncak gibi ücretsiz ilanları burada bulabilirsiniz.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 mb-8 md:mb-0">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="font-semibold text-lg mb-4 text-gray-900">Alt Kategoriler</h2>
            <ul className="space-y-3">
              {category.subcategories?.map((sub: any) => (
                <li key={sub.slug}>
                  <Link 
                    href={`/kategori/ucretsiz-gel-al/${sub.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group"
                  >
                    <div className="flex-shrink-0">
                      {getIconComponent(sub.icon)}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                        {sub.name}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
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
              category="ucretsiz-gel-al" 
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
              category="ucretsiz-gel-al" 
              listings={mappedListings} 
            />
          </section>
        </main>
      </div>
    </div>
  )
} 

