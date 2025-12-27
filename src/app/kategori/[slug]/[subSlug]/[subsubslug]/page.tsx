import { categories } from '@/lib/categories'
import { Sidebar } from '@/components/sidebar'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Home, Sparkles, Star, MapPin, Users, Clock, Shield, Award } from 'lucide-react'

export default async function SubSubCategoryPage({ params }: { params: Promise<{ slug: string; subSlug: string; subSubSlug: string }> }) {
  const { slug, subSlug, subSubSlug } = await params;

  // Ana kategoriyi bul
  const foundCategory = categories.find((cat) => cat.slug === slug)
  if (!foundCategory) {
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

  // Alt kategoriyi bul
  const foundSubcategory = foundCategory.subcategories?.find((sub) => sub.slug === subSlug)
  if (!foundSubcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Alt kategori bulunamadı</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  // Alt-alt kategoriyi bul
  const foundSubSubcategory = foundSubcategory.subcategories?.find((subsub) => subsub.slug === subSubSlug)
  if (!foundSubSubcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Alt-alt kategori bulunamadı</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  // Diğer alt-alt kategoriler
  const otherSubSubcategories = foundSubcategory.subcategories?.filter((subsub) => subsub.slug !== subSubSlug) || []

  // Listings data'sını filtrele
  const mappedListings = rawListings.filter(listing => 
    listing.category.toLowerCase() === slug.toLowerCase() && 
    listing.subCategory?.toLowerCase() === subSlug.toLowerCase()
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
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
                <Link href={`/kategori/${foundCategory.slug}`} className="text-gray-700 hover:text-blue-600">
                  {foundCategory.name}
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href={`/kategori/${foundCategory.slug}/${foundSubcategory.slug}`} className="text-gray-700 hover:text-blue-600">
                  {foundSubcategory.name}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{foundSubSubcategory.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sol Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar />
          </div>

          {/* Ana İçerik */}
          <div className="flex-1 space-y-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-3 text-2xl">{typeof foundSubSubcategory.icon === 'string' ? foundSubSubcategory.icon : '•'}</span>
                {foundSubSubcategory.name} Hizmetleri
              </h1>
              <p className="text-gray-600">
                Profesyonel {foundSubSubcategory.name.toLowerCase()} hizmetleri ile evinizi temiz ve düzenli tutun.
              </p>
            </div>

            <section>
              <FeaturedAds 
                title={`Öne Çıkan ${foundSubSubcategory.name} Hizmetleri`}
                category={foundCategory.slug} 
                subcategory={foundSubcategory.slug} 
                subSubcategory={foundSubSubcategory.slug} 
                listings={mappedListings} 
              />
            </section>
            
            <section>
              <LatestAds 
                title={`Son Eklenen ${foundSubSubcategory.name} Hizmetleri`}
                category={foundCategory.slug} 
                subcategory={foundSubcategory.slug} 
                subSubcategory={foundSubSubcategory.slug} 
                listings={mappedListings} 
              />
            </section>
          </div>
        </div>
      </div>
    </main>
  )
} 