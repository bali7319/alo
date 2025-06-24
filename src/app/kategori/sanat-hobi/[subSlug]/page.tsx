import { listings } from "@/lib/listings";
import { ListingCard } from "@/components/listing-card";
import { Listing } from "@/types/listings";
import { categories } from "@/lib/categories";
import Link from "next/link";
import { FeaturedAds } from "@/components/featured-ads";
import { LatestAds } from "@/components/latest-ads";

// generateStaticParams fonksiyonu ekle
export async function generateStaticParams() {
  const sanatHobiCategory = categories.find(cat => cat.slug === 'sanat-hobi');
  return sanatHobiCategory?.subcategories?.map((subcategory) => ({
    subSlug: subcategory.slug,
  })) || [];
}

export default async function SanatHobiSubPage({ params }: { params: Promise<{ subSlug: string }> }) {
  const { subSlug } = await params;

  // Sanat & Hobi kategorisini bul
  const sanatHobiCategory = categories.find(cat => cat.slug === 'sanat-hobi');
  const subcategory = sanatHobiCategory?.subcategories?.find(sub => sub.slug === subSlug);

  // İlgili alt kategorinin ilanlarını filtrele
  const filteredListings = listings
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
    }));

  // Diğer alt kategoriler
  const otherSubcategories = sanatHobiCategory?.subcategories?.filter(sub => sub.slug !== subSlug) || [];

  if (!sanatHobiCategory || !subcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Alt kategori bulunamadı</h1>
          <Link href="/kategori/sanat-hobi" className="text-blue-600 hover:text-blue-800">
            Sanat & Hobi kategorisine dön
          </Link>
        </div>
      </div>
    );
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
          <li className="text-gray-900">{subcategory.name}</li>
        </ol>
      </nav>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <h2 className="font-semibold mb-4 text-lg">Diğer Kategoriler</h2>
          <ul className="space-y-2">
            {otherSubcategories.map((sub) => (
              <li key={sub.slug}>
                <Link 
                  href={`/kategori/sanat-hobi/${sub.slug}`}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <span className="text-lg">
                    {typeof sub.icon === 'string' ? sub.icon : '🎨'}
                  </span>
                  <span>{sub.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-6">{subcategory.name}</h1>
          
          <FeaturedAds category="sanat-hobi" subcategory={subSlug} listings={filteredListings} />
          <LatestAds category="sanat-hobi" subcategory={subSlug} listings={filteredListings} />
        </main>
      </div>
    </div>
  );
} 