import { listings } from "@/lib/listings";
import { ListingCard } from "@/components/listing-card";
import { Listing } from "@/types/listings";
import Link from "next/link";
import { FeaturedAds } from "@/components/featured-ads";
import { LatestAds } from "@/components/latest-ads";

// Hobi & Sanat kategorisi tanımı
const hobiSanatCategory = {
  name: "Hobi & Sanat",
  slug: "hobi-sanat",
  icon: "🎨",
  subcategories: [
    { name: "Resim", slug: "resim", icon: "🎨" },
    { name: "Müzik", slug: "muzik", icon: "🎵" },
    { name: "Seramik", slug: "seramik", icon: "🏺" },
    { name: "Fotoğrafçılık", slug: "fotografcilik", icon: "📸" },
    { name: "El Sanatları", slug: "el-sanatlari", icon: "🧶" },
    { name: "Koleksiyon", slug: "koleksiyon", icon: "📦" },
    { name: "Diğer", slug: "diger", icon: "🎭" }
  ]
}

// generateStaticParams fonksiyonu ekle
export async function generateStaticParams() {
  return hobiSanatCategory.subcategories.map((subcategory) => ({
    subSlug: subcategory.slug,
  }));
}

export default async function HobiSanatSubPage({ params }: { params: Promise<{ subSlug: string }> }) {
  const { subSlug } = await params;

  // Alt kategoriyi bul
  const subcategory = hobiSanatCategory.subcategories.find(sub => sub.slug === subSlug);

  // İlgili alt kategorinin ilanlarını filtrele
  const filteredListings = listings
    .filter(listing => 
      (listing.category.toLowerCase() === 'hobi-sanat' || listing.category.toLowerCase() === 'sanat-hobi') && 
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
  const otherSubcategories = hobiSanatCategory.subcategories.filter(sub => sub.slug !== subSlug);

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Alt kategori bulunamadı</h1>
          <Link href="/kategori/hobi-sanat" className="text-blue-600 hover:text-blue-800">
            Hobi & Sanat kategorisine dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600 flex items-center">
              Ana Sayfa
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/kategori/hobi-sanat" className="text-gray-700 hover:text-blue-600">
                Hobi & Sanat
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">{subcategory.name}</span>
            </div>
          </li>
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
                  href={`/kategori/hobi-sanat/${sub.slug}`}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <span className="text-lg">{sub.icon}</span>
                  <span>{sub.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-6">{subcategory.name}</h1>
          
          <FeaturedAds category="hobi-sanat" subcategory={subSlug} listings={filteredListings} />
          <LatestAds category="hobi-sanat" subcategory={subSlug} listings={filteredListings} />
        </main>
      </div>
    </div>
  );
} 