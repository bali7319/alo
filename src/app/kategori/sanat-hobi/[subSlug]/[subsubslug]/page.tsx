'use client'

import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'

export default function SanatHobiSubSubCategoryPage({ params }: { params: Promise<{ subSlug: string; subsubslug: string }> }) {
  const [mappedListings, setMappedListings] = useState<Listing[]>([])
  const [category, setCategory] = useState<any>(null)
  const [subcategory, setSubcategory] = useState<any>(null)
  const [subSubcategory, setSubSubcategory] = useState<any>(null)
  const [otherSubSubcategories, setOtherSubSubcategories] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      const { subSlug, subsubslug } = await params;

      // Sanat & Hobi kategorisini bul
      const foundCategory = categories.find((cat) => cat.slug === 'sanat-hobi')
      if (!foundCategory) return

      // Alt kategoriyi bul
      const foundSubcategory = foundCategory.subcategories?.find((sub) => sub.slug === subSlug)
      if (!foundSubcategory) return

      // Alt-alt kategoriyi bul
      const foundSubSubcategory = foundSubcategory.subcategories?.find((subsub) => subsub.slug === subsubslug)
      if (!foundSubSubcategory) return

      // Diğer alt-alt kategoriler
      const otherSubSubs = foundSubcategory.subcategories?.filter((subsub) => subsub.slug !== subsubslug) || []

      setCategory(foundCategory)
      setSubcategory(foundSubcategory)
      setSubSubcategory(foundSubSubcategory)
      setOtherSubSubcategories(otherSubSubs)

      // Listings data'sını doğru formata dönüştür
      const mapped = rawListings
        .filter(listing => 
          listing.category.toLowerCase() === 'sanat-hobi' && 
          (listing.subCategory?.toLowerCase() === subSlug.toLowerCase())
        )
        .map(listing => ({
          id: listing.id.toString(),
          title: listing.title,
          description: listing.description,
          price: listing.price,
          location: listing.location,
          category: listing.category,
          subCategory: listing.subCategory ?? '',
          subSubCategory: undefined,
          images: [],
          isPremium: listing.isPremium,
          premiumUntil: listing.premiumUntil ?? '',
          createdAt: listing.createdAt ?? '',
          user: { id: '', name: '', email: '' },
        }))
      
      setMappedListings(mapped)
    })();
  }, [params])

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

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex space-x-2">
          <li>
            <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/kategori/sanat-hobi" className="hover:text-blue-600">Sanat & Hobi</Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/kategori/sanat-hobi/${subcategory.slug}`} className="hover:text-blue-600">
              {subcategory.name}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900">{subSubcategory.name}</li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold mb-4">{subSubcategory?.name || 'Kategori Bulunamadı'}</h1>
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <h2 className="font-semibold mb-2">Diğer Alt Kategoriler</h2>
          <ul className="space-y-1">
            {otherSubSubcategories.map((subsub: any) => (
              <li key={subsub.slug}>
                <Link 
                  href={`/kategori/sanat-hobi/${subcategory.slug}/${subsub.slug}`}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <span className="text-lg">
                    {typeof subsub.icon === 'string' ? subsub.icon : '🎨'}
                  </span>
                  <span>{subsub.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        {/* İçerik */}
        <main className="flex-1">
          <FeaturedAds category={category.slug} subcategory={subcategory.slug} subSubcategory={subSubcategory.slug} listings={mappedListings} />
          <LatestAds category={category.slug} subcategory={subcategory.slug} subSubcategory={subSubcategory.slug} listings={mappedListings} />
        </main>
      </div>
    </div>
  )
} 