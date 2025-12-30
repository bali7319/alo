import { categories } from '@/lib/categories'
import { Sidebar } from '@/components/sidebar'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { prisma } from '@/lib/prisma'

// Timeout wrapper
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

// generateStaticParams fonksiyonu ekle
export async function generateStaticParams() {
  const params: { subSlug: string }[] = [];
  
  // Turizm & Konaklama kategorisinin alt kategorileri için statik parametreler oluştur
  const foundCategory = categories.find((cat) => cat.slug === 'turizm-konaklama');
  foundCategory?.subcategories?.forEach((subcategory) => {
    params.push({
      subSlug: subcategory.slug,
    });
  });
  
  return params;
}

export default async function TurizmAltKategoriPage({ params }: { params: Promise<{ subSlug: string }> }) {
  const { subSlug } = await params;
  
  const foundCategory = categories.find((cat) => cat.slug === 'turizm-konaklama')
  if (!foundCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategori bulunamadı</h1>
          <Link href="/kategori/turizm-konaklama" className="text-blue-600 hover:text-blue-800">
            Turizm & Konaklama'ya dön
          </Link>
        </div>
      </div>
    )
  }
  
  const foundSubcategory = foundCategory.subcategories?.find((sub: any) => sub.slug === subSlug)
  if (!foundSubcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Alt kategori bulunamadı</h1>
          <Link href="/kategori/turizm-konaklama" className="text-blue-600 hover:text-blue-800">
            Turizm & Konaklama'ya dön
          </Link>
        </div>
      </div>
    )
  }
  
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
                { category: 'turizm-konaklama' },
                { category: 'Turizm & Konaklama' },
              ],
            },
            {
              OR: [
                { subCategory: subSlug },
                { subCategory: foundSubcategory.name },
              ],
            },
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

  const formattedListings = listings.map(listing => {
    const parsedImages = safeParseImages(listing.images);
    const firstImage = parsedImages.length > 0 ? [parsedImages[0]] : [];

    return {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      location: listing.location,
      category: listing.category,
      subCategory: listing.subCategory || undefined,
      description: listing.description?.substring(0, 200) + (listing.description?.length > 200 ? '...' : ''),
      images: firstImage,
      createdAt: listing.createdAt.toISOString(),
      condition: listing.condition,
      isPremium: listing.isPremium,
      premiumUntil: listing.premiumUntil?.toISOString(),
      expiresAt: listing.expiresAt.toISOString(),
      views: listing.views,
      user: {
        ...listing.user,
        name: listing.user?.name ?? undefined,
      },
    };
  });

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
                <Link href="/kategori/turizm-konaklama" className="text-gray-700 hover:text-blue-600">
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

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sol Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar />
          </div>

          {/* Ana İçerik */}
          <div className="flex-1 space-y-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-3 text-2xl">{typeof foundSubcategory.icon === 'string' ? foundSubcategory.icon : '•'}</span>
                {foundSubcategory.name}
              </h1>
              <p className="text-gray-600">
                {foundSubcategory.name} kategorisinde en iyi ürünleri ve hizmetleri keşfedin.
              </p>
            </div>

            <section>
              <FeaturedAds 
                title={`Öne Çıkan ${foundSubcategory.name}`}
                category="turizm-konaklama" 
                listings={formattedListings} 
              />
            </section>
            
            <section>
              <LatestAds 
                title={`Son Eklenen ${foundSubcategory.name}`}
                category="turizm-konaklama" 
                listings={formattedListings} 
              />
            </section>
          </div>
        </div>
      </div>
    </main>
  )
} 