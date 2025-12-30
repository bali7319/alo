import { categories } from "@/lib/categories";
import { Sidebar } from "@/components/sidebar";
import Link from "next/link";
import { FeaturedAds } from "@/components/featured-ads";
import { LatestAds } from "@/components/latest-ads";
import { prisma } from "@/lib/prisma";
import { Home } from "lucide-react";

// Timeout wrapper
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

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

  // Alt kategori slug'ını isme çevir
  const subCategoryMap: { [key: string]: string } = {
    'aydinlatma': 'Aydınlatma',
    'bahce-aletleri': 'Bahçe Aletleri',
    'beyaz-esya': 'Beyaz Eşya',
    'dekorasyon': 'Dekorasyon',
    'guvenlik': 'Güvenlik',
    'isitma-sogutma': 'Isıtma/Soğutma',
    'mobilya': 'Mobilya',
    'mutfak-gerecleri': 'Mutfak Gereçleri',
    'temizlik': 'Temizlik',
  };

  const subCategoryName = subCategoryMap[subSlug] || subcategory?.name;

  // Güvenli JSON parse fonksiyonu
  const safeParseImages = (images: string | null): string[] => {
    if (!images) return [];
    try {
      if (typeof images === 'string') {
        if (images.startsWith('data:image')) {
          return [images];
        }
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(images) ? images : [];
    } catch {
      return [];
    }
  };

  // Veritabanından ilanları çek
  let listings: any[] = [];
  try {
    listings = await withTimeout(
      prisma.listing.findMany({
        where: {
          AND: [
            {
              OR: [
                { category: 'Ev & Bahçe' },
                { category: 'ev-ve-bahce' },
              ],
            },
            subCategoryName ? {
              OR: [
                { subCategory: subCategoryName },
                { subCategory: subSlug },
              ],
            } : {},
            {
              isActive: true,
              approvalStatus: 'approved',
              expiresAt: {
                gt: new Date()
              }
            }
          ]
        },
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          category: true,
          subCategory: true,
          description: true,
          images: true,
          createdAt: true,
          condition: true,
          isPremium: true,
          premiumUntil: true,
          expiresAt: true,
          views: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { isPremium: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 50,
      }),
      5000
    );
  } catch (error) {
    console.error('Alt kategori ilanları getirme hatası:', error);
    listings = [];
  }

  const listingsForSub = listings.map(listing => {
    const parsedImages = safeParseImages(listing.images);
    const firstImage = parsedImages.length > 0 ? [parsedImages[0]] : [];

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description?.substring(0, 200) + (listing.description?.length > 200 ? '...' : ''),
      price: listing.price,
      location: listing.location,
      category: listing.category,
      subCategory: listing.subCategory || undefined,
      images: firstImage,
      isPremium: listing.isPremium,
      premiumUntil: listing.premiumUntil?.toISOString(),
      createdAt: listing.createdAt.toISOString(),
      condition: listing.condition,
      views: listing.views,
      user: {
        id: listing.user.id,
        name: listing.user.name || undefined,
        email: listing.user.email || '',
      },
    };
  });

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
                <Link href="/kategori/ev-ve-bahce" className="text-gray-700 hover:text-blue-600">
                  Ev & Bahçe
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

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sol Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar />
          </div>

          {/* Ana İçerik */}
          <div className="flex-1 space-y-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-3 text-2xl">{typeof subcategory.icon === 'string' ? subcategory.icon : '•'}</span>
                {subcategory.name}
              </h1>
              <p className="text-gray-600">
                {subcategory.name} kategorisinde en iyi ürünleri ve hizmetleri keşfedin.
              </p>
            </div>

            <section>
              <FeaturedAds 
                title={`Öne Çıkan ${subcategory.name}`}
                category="ev-ve-bahce" 
                subcategory={subSlug} 
                listings={listingsForSub} 
              />
            </section>
            
            <section>
              <LatestAds 
                title={`Son Eklenen ${subcategory.name}`}
                category="ev-ve-bahce" 
                subcategory={subSlug} 
                listings={listingsForSub} 
              />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
} 