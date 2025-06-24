import { categories } from '@/lib/categories'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { listings as rawListings } from '@/lib/listings'
import { Listing } from '@/types/listings'
import { Home, Sparkles, Star, MapPin, Users, Clock, Shield, Award } from 'lucide-react'

// generateStaticParams fonksiyonu ekle
export async function generateStaticParams() {
  const params: { slug: string; subSlug: string; subsubslug: string }[] = [];
  
  // Tüm kategoriler, alt kategoriler ve alt-alt kategoriler için statik parametreler oluştur
  categories.forEach((category) => {
    category.subcategories?.forEach((subcategory) => {
      subcategory.subcategories?.forEach((subSubcategory) => {
        params.push({
          slug: category.slug,
          subSlug: subcategory.slug,
          subsubslug: subSubcategory.slug,
        });
      });
    });
  });
  
  return params;
}

export default async function SubSubCategoryPage({ params }: { params: Promise<{ slug: string; subSlug: string; subsubslug: string }> }) {
  const { slug, subSlug, subsubslug } = await params;

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

  // Listings data'sını filtrele
  const mappedListings = rawListings.filter(listing => 
    listing.category.toLowerCase() === slug.toLowerCase() && 
    listing.subCategory?.toLowerCase() === subSlug.toLowerCase()
  )

  return (
    <div className="container mx-auto py-8">
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

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
              Diğer {foundSubcategory.name} Hizmetleri
            </h2>
            <ul className="space-y-2">
              {otherSubSubcategories.map((subsub: any) => (
                <li key={subsub.slug}>
                  <Link 
                    href={`/kategori/${foundCategory.slug}/${foundSubcategory.slug}/${subsub.slug}`}
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span className="mr-2 text-lg">{typeof subsub.icon === 'string' ? subsub.icon : '•'}</span>
                    {subsub.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h3 className="font-semibold mb-3 flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                Hizmet Özellikleri
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Shield className="w-4 h-4 text-green-500 mr-2" />
                  Güvenilir Hizmet
                </li>
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-2" />
                  Hızlı Teslimat
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 text-purple-500 mr-2" />
                  Uzman Ekip
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-yellow-500 mr-2" />
                  Kaliteli Hizmet
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 text-red-500 mr-2" />
                  Yerel Hizmet
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="mr-3 text-2xl">{typeof foundSubSubcategory.icon === 'string' ? foundSubSubcategory.icon : '•'}</span>
              {foundSubSubcategory.name} Hizmetleri
            </h1>
            <p className="text-gray-600">
              Profesyonel {foundSubSubcategory.name.toLowerCase()} hizmetleri ile evinizi temiz ve düzenli tutun.
            </p>
          </div>

          {/* Featured Ads */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Öne Çıkan {foundSubSubcategory.name} Hizmetleri
            </h2>
            <FeaturedAds 
              category={foundCategory.slug} 
              subcategory={foundSubcategory.slug} 
              subSubcategory={foundSubSubcategory.slug} 
              listings={mappedListings} 
            />
          </div>

          {/* Latest Ads */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              Son Eklenen {foundSubSubcategory.name} Hizmetleri
            </h2>
            <LatestAds 
              category={foundCategory.slug} 
              subcategory={foundSubcategory.slug} 
              subSubcategory={foundSubSubcategory.slug} 
              listings={mappedListings} 
            />
          </div>
        </main>
      </div>
    </div>
  )
} 