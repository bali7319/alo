import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Lightbulb, Zap, Moon } from 'lucide-react'

export default function AydinlatmaPage() {
  // Server-side data fetching
  const foundCategory = categories.find((cat) => cat.slug === 'ev-ve-bahce')
  const foundSubcategory = foundCategory?.subcategories?.find((sub) => sub.slug === 'aydinlatma')
  
  const aydinlatmaListings: Listing[] = rawListings
    .filter(listing => 
      listing.category.toLowerCase() === 'ev-ve-bahce' && 
      (listing.subCategory?.toLowerCase() ?? '') === 'aydinlatma'
    )

  if (!foundCategory || !foundSubcategory) {
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
              <Link href={`/kategori/${foundCategory.slug}`} className="text-gray-700 hover:text-blue-600">
                {foundCategory.name}
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">{foundSubcategory.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
              Alt Kategoriler
            </h2>
            <ul className="space-y-2">
              {foundSubcategory.subcategories?.map((subsub: any) => (
                <li key={subsub.slug}>
                  <Link 
                    href={`/kategori/${foundCategory.slug}/${foundSubcategory.slug}/${subsub.slug}`}
                    className="flex items-center text-gray-700 hover:text-yellow-600 transition-colors"
                  >
                    <span className="mr-2">{typeof subsub.icon === 'string' ? subsub.icon : '•'}</span>
                    {subsub.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h3 className="font-semibold mb-3">Aydınlatma Kategorileri</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
                  Avize & Sarkıt
                </li>
                <li className="flex items-center">
                  <Zap className="w-4 h-4 text-blue-500 mr-2" />
                  LED Aydınlatma
                </li>
                <li className="flex items-center">
                  <Moon className="w-4 h-4 text-indigo-500 mr-2" />
                  Gece Lambaları
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {foundSubcategory.name}
            </h1>
            <p className="text-gray-600">
              Modern aydınlatma çözümleri ve lambalar
            </p>
          </div>

          {/* Featured Ads */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Öne Çıkan Aydınlatma İlanları</h2>
            <FeaturedAds 
              category={foundCategory.slug} 
              subcategory={foundSubcategory.slug} 
              listings={aydinlatmaListings} 
            />
          </div>

          {/* Latest Ads */}
          <div>
            <h2 className="text-xl font-semibold mb-4">En Yeni Aydınlatma İlanları</h2>
            <LatestAds 
              category={foundCategory.slug} 
              subcategory={foundSubcategory.slug} 
              listings={aydinlatmaListings} 
            />
          </div>
        </main>
      </div>
    </div>
  )
} 
