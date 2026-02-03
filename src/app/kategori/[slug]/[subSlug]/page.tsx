import { categories } from '@/lib/categories'
import { Sidebar } from '@/components/sidebar'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { Home, Sparkles, Star, Clock } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const revalidate = 300; // 5 dakika cache
export const dynamicParams = true;

// Timeout wrapper - 8 saniye içinde cevap vermezse hata döndür
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

export default async function SubCategoryPage({ params }: { params: Promise<{ slug: string; subSlug: string }> }) {
  const { slug, subSlug } = await params;

  // Ana kategoriyi bul
  const foundCategory = categories.find((cat) => cat.slug === slug)
  if (!foundCategory) notFound();

  // Alt kategoriyi bul
  const foundSubcategory = foundCategory.subcategories?.find((sub) => sub.slug === subSlug)
  if (!foundSubcategory) notFound();

  // Diğer alt kategoriler
  const otherSubcategories = foundCategory.subcategories?.filter((sub) => sub.slug !== subSlug) || []

  const categoryName = foundCategory.name;
  const subCategoryName = foundSubcategory.name;

  // Güvenli JSON parse fonksiyonu
  const safeParseImages = (images: string | null): string[] => {
    if (!images) return [];
    try {
      if (typeof images === 'string') {
        // Eğer zaten base64 string ise (data:image ile başlıyorsa), array olarak döndür
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

  // Veritabanından ilanları çek (build sırasında hata olursa boş liste)
  // PERFORMANS: Sadece ilk 100 ilanı çek
  let listings: any[] = [];
  try {
    listings = await withTimeout(
      prisma.listing.findMany({
        where: {
          AND: [
            {
              OR: [
                { category: categoryName }, // Tam kategori adı formatında
                { category: slug }, // Slug formatında
              ],
            },
            {
              OR: [
                { subCategory: subCategoryName },
                { subCategory: subSlug },
                { subCategory: foundSubcategory.name },
              ].filter(Boolean), // undefined değerleri filtrele
            },
            {
              isActive: true,
              approvalStatus: 'approved',
              expiresAt: {
                gt: new Date() // Süresi dolmamış ilanlar
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
          { isPremium: 'desc' }, // Premium ilanlar önce
          { createdAt: 'desc' }, // Sonra tarihe göre
        ],
        take: 50, // PERFORMANS: İlk sayfa için 50 ilan yeterli
      }),
      5000 // 5 saniye timeout (8'den 5'e düşürüldü)
    );
  } catch (error) {
    // Build sırasında veritabanı bağlantısı yoksa boş liste
    console.error('Alt kategori ilanları getirme hatası:', error);
    console.warn('Database connection failed during build, using empty listings');
    listings = []; // Boş liste döndür
  }

  const formattedListings = listings.map(listing => {
    const parsedImages = safeParseImages(listing.images);
    // Sadece ilk resmi gönder (performans için)
    const firstImage = parsedImages.length > 0 ? [parsedImages[0]] : [];

    return {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      location: listing.location,
      category: listing.category,
      subCategory: listing.subCategory || undefined,
      description: listing.description?.substring(0, 200) + (listing.description?.length > 200 ? '...' : ''),
      images: firstImage, // İlk resmi gönder
      createdAt: listing.createdAt.toISOString(),
      condition: listing.condition,
      isPremium: listing.isPremium,
      premiumUntil: listing.premiumUntil?.toISOString(),
      expiresAt: listing.expiresAt.toISOString(),
      views: listing.views,
      user: {
        id: listing.user.id,
        name: listing.user.name || undefined,
        email: listing.user.email,
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
                <Link href={`/kategori/${foundCategory.slug}`} className="text-gray-700 hover:text-blue-600">
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
          {/* Sol Sidebar - Mobilde gizli, toggle butonu ile açılır */}
          <div className="hidden md:block w-full md:w-64 flex-shrink-0">
            <Sidebar />
          </div>
          {/* Mobil Sidebar - Toggle butonu ile açılır */}
          <div className="md:hidden">
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
                category={foundCategory.slug} 
                subcategory={foundSubcategory.slug} 
                listings={formattedListings} 
              />
            </section>
            
            <section>
              <LatestAds 
                title={`Son Eklenen ${foundSubcategory.name}`}
                category={foundCategory.slug} 
                subcategory={foundSubcategory.slug} 
                listings={formattedListings} 
              />
            </section>
          </div>
        </div>
      </div>
    </main>
  )
} 