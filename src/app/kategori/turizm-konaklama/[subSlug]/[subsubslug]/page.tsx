"use client"

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Hotel, Plane, Car, Ship, Calendar, Star } from 'lucide-react'

export default function TurizmAltAltKategoriPage() {
  const params = useParams() as { subSlug: string, subsubslug: string }
  const [category, setCategory] = useState<any>(null)
  const [subcategory, setSubcategory] = useState<any>(null)
  const [subSubcategory, setSubSubcategory] = useState<any>(null)
  const [mappedListings, setMappedListings] = useState<Listing[]>([])
  const [otherSubSubcategories, setOtherSubSubcategories] = useState<any[]>([])

  useEffect(() => {
    const foundCategory = categories.find((cat) => cat.slug === 'turizm-konaklama')
    if (!foundCategory) return
    setCategory(foundCategory)
    const foundSubcategory = foundCategory.subcategories?.find((sub: any) => sub.slug === params.subSlug)
    if (!foundSubcategory) return
    setSubcategory(foundSubcategory)
    const foundSubSubcategory = foundSubcategory.subcategories?.find((subsub: any) => subsub.slug === params.subsubslug)
    if (!foundSubSubcategory) return
    setSubSubcategory(foundSubSubcategory)
    setOtherSubSubcategories(foundSubcategory.subcategories?.filter((subsub: any) => subsub.slug !== params.subsubslug) || [])
    const mapped = rawListings
      .filter(listing => listing.category.toLowerCase() === 'turizm-konaklama' && listing.subCategory?.toLowerCase() === params.subSlug && listing.subSubCategory?.toLowerCase() === params.subsubslug)
      .map(listing => ({
        id: listing.id.toString(),
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        category: listing.category,
        subCategory: listing.subCategory,
        subSubCategory: listing.subSubCategory,
        images: [''],
        isPremium: listing.isPremium,
        premiumUntil: listing.premiumUntil,
        createdAt: listing.createdAt,
        user: {
          id: '',
          name: listing.title,
          email: '',
        },
      }))
    setMappedListings(mapped)
  }, [params])

  if (!category || !subcategory || !subSubcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Alt-alt kategori bulunamadı</h1>
          <Link href="/kategori/turizm-konaklama" className="text-blue-600 hover:text-blue-800">
            Turizm & Konaklama'ya dön
          </Link>
        </div>
      </div>
    )
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      '🏨': <Hotel className="w-6 h-6 text-blue-500" />,
      '🚢': <Ship className="w-6 h-6 text-blue-600" />,
      '✈️': <Plane className="w-6 h-6 text-blue-400" />,
      '🚗': <Car className="w-6 h-6 text-green-500" />,
      '🏠': <div className="w-6 h-6 text-orange-500 text-xl">🏠</div>,
      '🏢': <div className="w-6 h-6 text-gray-600 text-xl">🏢</div>,
      '🏖️': <div className="w-6 h-6 text-yellow-500 text-xl">🏖️</div>,
      '🏰': <div className="w-6 h-6 text-purple-500 text-xl">🏰</div>,
      '🏛️': <div className="w-6 h-6 text-red-500 text-xl">🏛️</div>,
      '🚌': <div className="w-6 h-6 text-green-600 text-xl">🚌</div>,
      '🌍': <div className="w-6 h-6 text-blue-700 text-xl">🌍</div>,
      '🛩️': <div className="w-6 h-6 text-indigo-500 text-xl">🛩️</div>,
      '🚙': <div className="w-6 h-6 text-green-400 text-xl">🚙</div>,
      '🚐': <div className="w-6 h-6 text-gray-500 text-xl">🚐</div>,
      '🏍️': <div className="w-6 h-6 text-red-600 text-xl">🏍️</div>,
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
              <Link href={`/kategori/turizm-konaklama/${subcategory.slug}`} className="text-sm font-medium text-gray-700 hover:text-blue-600">
                {subcategory.name}
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500">{subSubcategory.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow">
            {getIconComponent(subSubcategory.icon)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subSubcategory.name}</h1>
            <p className="text-gray-600 max-w-xl">{subSubcategory.description || `${subSubcategory.name} ile ilgili ilanlar burada.`}</p>
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
                    href={`/kategori/turizm-konaklama/${subcategory.slug}/${subsub.slug}`}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors group ${subsub.slug === params.subsubslug ? 'bg-blue-100 font-bold text-blue-700' : 'hover:bg-blue-50'}`}
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
              category="turizm-konaklama" 
              subcategory={subcategory.slug}
              subSubcategory={subSubcategory.slug}
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
              category="turizm-konaklama" 
              subcategory={subcategory.slug}
              subSubcategory={subSubcategory.slug}
              listings={mappedListings} 
            />
          </section>
        </main>
      </div>
    </div>
  )
} 