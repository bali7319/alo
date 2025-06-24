import { listings } from "@/lib/listings";
import { ListingCard } from "@/components/listing-card";
import { Listing } from "@/types/listings";
import { categories } from "@/lib/categories";
import Link from "next/link";
import { FeaturedAds } from "@/components/featured-ads";
import { LatestAds } from "@/components/latest-ads";

export async function generateStaticParams() {
  const params: { subSlug: string }[] = [];
  
  // Ev & Bahçe kategorisinin alt kategorileri için statik parametreler oluştur
  const evVeBahceCategory = categories.find(cat => cat.slug === 'ev-ve-bahce');
  evVeBahceCategory?.subcategories?.forEach((subcategory) => {
    params.push({
      subSlug: subcategory.slug,
    });
  });
  
  return params;
}

export default async function EvVeBahceSubPage({ params }: { params: Promise<{ subSlug: string }> }) {
  const { subSlug } = await params;

  // Ev & Bahçe kategorisini bul
  const evVeBahceCategory = categories.find(cat => cat.slug === 'ev-ve-bahce');
  const subcategory = evVeBahceCategory?.subcategories?.find(sub => sub.slug === subSlug);

  // İlgili alt kategorinin ilanlarını filtrele
  const listingsForSub = listings.filter(listing => 
    listing.category === 'ev-ve-bahce' && 
    listing.subCategory === subSlug
  );

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Alt kategori bulunamadı</h1>
          <Link href="/kategori/ev-ve-bahce" className="text-blue-600 hover:text-blue-800">
            Ev & Bahçe'ye Dön
          </Link>
        </div>
      </div>
    );
  }

  // Diğer alt kategoriler
  const otherSubcategories = evVeBahceCategory?.subcategories?.filter(sub => sub.slug !== subSlug) || [];

  // Alt kategori renkleri
  const subcategoryColors: { [key: string]: string } = {
    'mobilya': 'text-amber-500',
    'beyaz-esya': 'text-blue-500',
    'mutfak-gerecleri': 'text-orange-500',
    'bahce-dis-mekan': 'text-green-500',
    'bahce-aletleri': 'text-emerald-500',
    'temizlik': 'text-purple-500',
    'dekorasyon': 'text-pink-500',
    'aydinlatma': 'text-yellow-500',
    'guvenlik': 'text-red-500',
    'diger': 'text-gray-500'
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/kategori/ev-ve-bahce" className="hover:text-blue-600">Ev & Bahçe</Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{subcategory.name}</li>
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
                  href={`/kategori/ev-ve-bahce/${sub.slug}`}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <span className={`text-lg ${subcategoryColors[sub.slug] || 'text-gray-500'}`}>
                    {typeof sub.icon === 'string' ? sub.icon : '🏠'}
                  </span>
                  <span>{sub.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* İçerik */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-6">{subcategory.name}</h1>
          
          <FeaturedAds 
            category="ev-ve-bahce" 
            subcategory={subSlug} 
            listings={listingsForSub} 
          />
          
          <LatestAds 
            category="ev-ve-bahce" 
            subcategory={subSlug} 
            listings={listingsForSub} 
          />
        </main>
      </div>
    </div>
  );
} 