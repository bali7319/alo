import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'

// generateStaticParams fonksiyonu ekle
export async function generateStaticParams() {
  const params: { subSlug: string; subsubslug: string }[] = [];
  
  // Sanat & Hobi kategorisinin tüm alt kategorileri ve alt-alt kategorileri için statik parametreler oluştur
  const foundCategory = categories.find((cat) => cat.slug === 'sanat-hobi');
  foundCategory?.subcategories?.forEach((subcategory) => {
    subcategory.subcategories?.forEach((subSubcategory) => {
      params.push({
        subSlug: subcategory.slug,
        subsubslug: subSubcategory.slug,
      });
    });
  });
  
  return params;
}

export default async function SanatHobiSubSubCategoryPage({ params }: { params: Promise<{ subSlug: string; subsubslug: string }> }) {
  const { subSlug, subsubslug } = await params;

  // Sanat & Hobi kategorisini bul
  const foundCategory = categories.find((cat) => cat.slug === 'sanat-hobi')
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
  const foundSubSubcategory = foundSubcategory.subcategories?.find((subsub) => subsub.slug === subsubslug)
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
  const otherSubSubcategories = foundSubcategory.subcategories?.filter((subsub) => subsub.slug !== subsubslug) || []

  // Listings data'sını doğru formata dönüştür
  const mappedListings = rawListings
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
            <Link href={`/kategori/sanat-hobi/${foundSubcategory.slug}`} className="hover:text-blue-600">
              {foundSubcategory.name}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900">{foundSubSubcategory.name}</li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold mb-4">{foundSubSubcategory?.name || 'Kategori Bulunamadı'}</h1>
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <h2 className="font-semibold mb-2">Diğer Alt Kategoriler</h2>
          <ul className="space-y-1">
            {otherSubSubcategories.map((subsub: any) => (
              <li key={subsub.slug}>
                <Link 
                  href={`/kategori/sanat-hobi/${foundSubcategory.slug}/${subsub.slug}`}
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
          <FeaturedAds category={foundCategory.slug} subcategory={foundSubcategory.slug} subSubcategory={foundSubSubcategory.slug} listings={mappedListings} />
          <LatestAds category={foundCategory.slug} subcategory={foundSubcategory.slug} subSubcategory={foundSubSubcategory.slug} listings={mappedListings} />
        </main>
      </div>
    </div>
  )
} 