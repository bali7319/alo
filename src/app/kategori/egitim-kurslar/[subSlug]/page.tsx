import { listings } from "@/lib/listings";
import { ListingCard } from "@/components/listing-card";
import { Listing } from "@/types/listings";
import { categories } from "@/lib/categories";
import Link from "next/link";
import { FeaturedAds } from "@/components/featured-ads";
import { LatestAds } from "@/components/latest-ads";

// generateStaticParams fonksiyonu ekle
export async function generateStaticParams() {
  const params: { subSlug: string }[] = [];
  
  // Eğitim & Kurslar kategorisinin alt kategorileri için statik parametreler oluştur
  const egitimKurslarCategory = categories.find(cat => cat.slug === 'egitim-kurslar');
  egitimKurslarCategory?.subcategories?.forEach((subcategory) => {
    params.push({
      subSlug: subcategory.slug,
    });
  });
  
  return params;
}

export default async function EgitimKurslarSubPage({ params }: { params: Promise<{ subSlug: string }> }) {
  const { subSlug } = await params;

  // Eğitim & Kurslar kategorisini bul
  const egitimKurslarCategory = categories.find(cat => cat.slug === 'egitim-kurslar');
  const subcategory = egitimKurslarCategory?.subcategories?.find(sub => sub.slug === subSlug);

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Alt kategori bulunamadı</h1>
          <Link href="/kategori/egitim-kurslar" className="text-blue-600 hover:text-blue-800">
            Eğitim ve Kurslar'a Dön
          </Link>
        </div>
      </div>
    );
  }

  // İlgili alt kategorinin ilanlarını filtrele
  const filteredListings = listings
    .filter(
      (listing) =>
        listing.category === "egitim-kurslar" &&
        listing.subCategory === subSlug
    )
    .map((listing) => ({
      id: listing.id.toString(),
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      category: listing.category,
      subCategory: listing.subCategory,
      images: listing.images,
      isPremium: listing.isPremium,
      premiumUntil: listing.premiumUntil,
      createdAt: listing.createdAt,
      user: listing.user,
    }));

  // Diğer alt kategoriler
  const otherSubcategories = egitimKurslarCategory?.subcategories?.filter(sub => sub.slug !== subSlug) || [];

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
              <Link href="/kategori/egitim-kurslar" className="text-gray-700 hover:text-blue-600">
                Eğitim & Kurslar
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
          {/* Alt Kategoriler */}
          {subcategory.subcategories && subcategory.subcategories.length > 0 && (
            <div className="mb-8">
              <h2 className="font-semibold mb-4 text-lg">Alt Kategoriler</h2>
              <ul className="space-y-2">
                {subcategory.subcategories.map((subsub) => (
                  <li key={subsub.slug}>
                    <Link 
                      href={`/kategori/egitim-kurslar/${subSlug}/${subsub.slug}`}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-lg">
                        {typeof subsub.icon === 'string' ? subsub.icon : '•'}
                      </span>
                      <span>{subsub.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Diğer Kategoriler */}
          <div>
            <h2 className="font-semibold mb-4 text-lg">Diğer Kategoriler</h2>
            <ul className="space-y-2">
              {otherSubcategories.map((sub) => (
                <li key={sub.slug}>
                  <Link 
                    href={`/kategori/egitim-kurslar/${sub.slug}`}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-lg">
                      {typeof sub.icon === 'string' ? sub.icon : '•'}
                    </span>
                    <span>{sub.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* İçerik */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-6">{subcategory.name}</h1>
          
          <FeaturedAds 
            category="egitim-kurslar" 
            subcategory={subSlug} 
            listings={filteredListings} 
          />
          
          <LatestAds 
            category="egitim-kurslar" 
            subcategory={subSlug} 
            listings={filteredListings} 
          />
        </main>
      </div>
    </div>
  );
} 