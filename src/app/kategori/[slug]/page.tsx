import { categories } from '@/lib/categories'
import { Sidebar } from '@/components/sidebar'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { Home, Sparkles, Star, MapPin, Users, Clock, Shield, Award } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import SeoJsonLd from '@/components/SeoJsonLd'
import { notFound, redirect } from 'next/navigation'

// Cache eklendi - performans için kritik
export const revalidate = 300; // 5 dakika cache
export const dynamicParams = true; // Bilinmeyen slug'lar için runtime'da render et

// Timeout wrapper - 8 saniye içinde cevap vermezse hata döndür
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

// SEO Metadata
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const pageParam = typeof sp.page === 'string' ? sp.page.trim() : '';
  const pageNum = pageParam && /^\d+$/.test(pageParam) ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const foundCategory = categories.find((cat) => cat.slug === slug);
  
  if (!foundCategory) {
    return {
      title: 'Kategori Bulunamadı',
    };
  }
  const categoryName = foundCategory.name;
  
  // İlan sayısını al (build sırasında hata olursa 0 döndür)
  let listingCount = 0;
  try {
    listingCount = await withTimeout(
      prisma.listing.count({
        where: {
          OR: [
            { category: slug }, // Slug formatında
            { category: categoryName }, // Tam kategori adı formatında
          ],
          isActive: true,
          approvalStatus: 'approved'
        }
      }),
      5000 // 5 saniye timeout
    );
  } catch (error) {
    // Build sırasında veritabanı bağlantısı yoksa varsayılan değer
    console.warn('Database connection failed during build, using default count');
  }

  const title =
    pageNum > 1
      ? `${categoryName} İlanları (Sayfa ${pageNum}) - Çanakkale | Alo17`
      : `${categoryName} İlanları - Çanakkale | Alo17`;
  const description = `Çanakkale'de ${categoryName} kategorisinde ${listingCount} aktif ilan. Ücretsiz ilan ver, ikinci el ${categoryName.toLowerCase()} al-sat. En iyi fiyatlar ve güvenilir satıcılar.`;

  return {
    title,
    description,
    keywords: [
      categoryName.toLowerCase(),
      `${categoryName} çanakkale`,
      `ikinci el ${categoryName.toLowerCase()}`,
      `satılık ${categoryName.toLowerCase()}`,
      `çanakkale ${categoryName.toLowerCase()} ilanları`,
      'alo17',
      'çanakkale ilan'
    ],
    openGraph: {
      title,
      description,
      url: `https://alo17.tr/kategori/${slug}`,
      siteName: 'Alo17',
      locale: 'tr_TR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://alo17.tr/kategori/${slug}`,
    },
    robots: pageNum > 1 ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const pageParam = typeof sp.page === 'string' ? sp.page.trim() : '';
  const currentPage = pageParam && /^\d+$/.test(pageParam) ? Math.max(1, parseInt(pageParam, 10)) : 1;

  const DEBUG =
    process.env.NODE_ENV !== 'production' || process.env.DEBUG_CATEGORY_PAGE === 'true';

  // Debug: Kategorileri ve slug'ı logla (prod'da kapalı)
  if (DEBUG) {
    console.log('CategoryPage - Slug:', slug);
    console.log('CategoryPage - Categories count:', categories.length);
    console.log('CategoryPage - Category slugs:', categories.map(c => c.slug));
  }

  // Ana kategoriyi bul
  const foundCategory = categories.find((cat) => cat.slug === slug)
  
  if (!foundCategory) {
    // Some links might incorrectly use the category name instead of slug (e.g. /kategori/İş).
    // Try to map name -> slug (Turkish locale) and redirect to canonical URL.
    const byName = categories.find(
      (cat) => cat.name.toLocaleLowerCase('tr-TR') === slug.toLocaleLowerCase('tr-TR')
    );
    if (byName) {
      redirect(`/kategori/${byName.slug}`);
    }

    if (DEBUG) {
      console.error('CategoryPage - Category not found for slug:', slug);
      console.error('CategoryPage - Available slugs:', categories.map(c => c.slug));
    }
    notFound();
  }
  
  if (DEBUG) {
    console.log('CategoryPage - Found category:', foundCategory.name);
    console.log('CategoryPage - Subcategories:', foundCategory.subcategories);
    console.log('CategoryPage - Subcategories length:', foundCategory.subcategories?.length);
  }

  // Diğer kategoriler
  const otherCategories = categories.filter((cat) => cat.slug !== slug)

  const categoryName = foundCategory.name;

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
  // Hem slug hem de tam kategori adı ile arama yap (veritabanında her ikisi de olabilir)
  // Kategori sayfasında sınırsız ilan çekmek performansı öldürür.
  // SEO + UX için makul bir üst sınır uygula, daha fazlası için ileride pagination eklenebilir.
  const PREMIUM_TAKE = 60;
  const PAGE_SIZE = 24;
  let allListings: any[] = [];
  let premiumListings: any[] = [];
  let totalListings = 0;
  try {
    const now = new Date();
    const baseWhere = {
      OR: [
        { category: slug },
        { category: categoryName },
      ],
      isActive: true,
      approvalStatus: 'approved',
      expiresAt: { gt: now },
    } as const;

    const premiumWhere = {
      ...baseWhere,
      OR: [
        { isPremium: true },
        { premiumUntil: { gt: now } },
      ],
    } as const;

    const nonPremiumWhere = {
      ...baseWhere,
      NOT: {
        OR: [
          { isPremium: true },
          { premiumUntil: { gt: now } },
        ],
      },
    } as const;

    const skip = (currentPage - 1) * PAGE_SIZE;

    const tasks: Array<Promise<any>> = [
      withTimeout(
        prisma.listing.findMany({
          where: nonPremiumWhere as any,
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
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: PAGE_SIZE,
        }),
        8000
      ),
      withTimeout(
        prisma.listing.count({ where: nonPremiumWhere as any }),
        5000
      ),
    ];

    // Premium only on page 1 (avoid duplicates + keep TTFB)
    if (currentPage === 1) {
      tasks.push(
        withTimeout(
          prisma.listing.findMany({
            where: premiumWhere as any,
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
              user: { select: { id: true, name: true } },
            },
            orderBy: [{ premiumUntil: 'desc' }, { createdAt: 'desc' }],
            take: PREMIUM_TAKE,
          }),
          8000
        )
      );
    }

    const results = await Promise.all(tasks);
    allListings = results[0] || [];
    totalListings = typeof results[1] === 'number' ? results[1] : 0;
    premiumListings = currentPage === 1 ? (results[2] || []) : [];
    
    if (DEBUG) {
      console.log(`[Kategori ${slug}] Toplam ilan: ${allListings.length}, Premium ilan: ${premiumListings.length}`);
    }
  } catch (error) {
    // Build sırasında veritabanı bağlantısı yoksa boş liste
    if (DEBUG) {
      console.error('Kategori ilanları getirme hatası:', error);
      console.warn('Database connection failed during build, using empty listings');
    }
    allListings = [];
    premiumListings = [];
  }

  // Premium ilanları formatla
  const formattedPremiumListings = premiumListings.map(listing => {
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
      description: listing.description?.substring(0, 200) + (listing.description?.length > 200 ? '...' : ''), // Kısaltıldı
      images: firstImage, // İlk resmi gönder
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

  // Tüm ilanları formatla
  const formattedListings = allListings.map(listing => {
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: 'https://alo17.tr/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: foundCategory.name,
        item: `https://alo17.tr/kategori/${slug}`,
      },
    ],
  }

  const totalPages = Math.max(1, Math.ceil((totalListings || 0) / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-gray-50">
      <SeoJsonLd id="ld-breadcrumb" data={breadcrumbJsonLd} />
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
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{foundCategory.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar (responsive; mobile uses internal toggle) */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar />
          </div>

          {/* Ana İçerik */}
          <div className="flex-1 space-y-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-3 text-2xl">{typeof foundCategory.icon === 'string' ? foundCategory.icon : '•'}</span>
                {foundCategory.name}
              </h1>
              <p className="text-gray-600 mb-6">
                {foundCategory.name} kategorisinde en iyi ürünleri ve hizmetleri keşfedin.
              </p>

              {/* Alt Kategoriler */}
              {foundCategory.subcategories && foundCategory.subcategories.length > 0 ? (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Alt Kategoriler</h2>
                  <div className="space-y-4">
                    {foundCategory.subcategories.map((subcategory) => {
                      const subSubcategories = subcategory.subcategories;
                      const hasSubSubcategories = subSubcategories && subSubcategories.length > 0;
                      if (DEBUG) {
                        console.log(`Subcategory: ${subcategory.name}, hasSubSubcategories: ${hasSubSubcategories}, count: ${subSubcategories?.length || 0}`);
                      }
                      return (
                        <div key={subcategory.slug} className="bg-white border border-gray-200 rounded-lg p-4">
                          <Link
                            href={`/kategori/${foundCategory.slug}/${subcategory.slug}`}
                            className="flex items-center gap-2 mb-2 hover:text-blue-600 transition-colors"
                          >
                            <span className="text-xl">
                              {typeof subcategory.icon === 'string' ? subcategory.icon : '•'}
                            </span>
                            <span className="text-base font-semibold text-gray-900">
                              {subcategory.name}
                            </span>
                          </Link>
                          {/* Alt kategorinin alt kategorileri */}
                          {subSubcategories && subSubcategories.length > 0 ? (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <h3 className="text-sm font-semibold text-gray-600 mb-2">Alt Kategoriler:</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {subSubcategories.map((subsubcategory) => (
                                  <Link
                                    key={subsubcategory.slug}
                                    href={`/kategori/${foundCategory.slug}/${subcategory.slug}/${subsubcategory.slug}`}
                                    className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                                  >
                                    <span className="text-base">
                                      {typeof subsubcategory.icon === 'string' ? subsubcategory.icon : '•'}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                      {subsubcategory.name}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-xs text-gray-400">
                              Debug: subSubcategories = {subSubcategories ? `array(${subSubcategories.length})` : 'undefined/null'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Bu kategoride alt kategori bulunmamaktadır.
                    <br />
                    Debug: foundCategory.subcategories = {foundCategory.subcategories ? JSON.stringify(foundCategory.subcategories.length) : 'undefined'}
                  </p>
                </div>
              )}
            </div>

            <section>
              <FeaturedAds 
                title={`Öne Çıkan ${foundCategory.name}`}
                category={foundCategory.slug} 
                listings={formattedPremiumListings} 
                limit={PREMIUM_TAKE}
              />
            </section>
            
            <section>
              <LatestAds 
                title={`Tüm ${foundCategory.name} İlanları`}
                category={foundCategory.slug} 
                listings={formattedListings} 
                limit={PAGE_SIZE}
              />
            </section>

            {/* Pagination (SEO-friendly query param) */}
            {totalPages > 1 ? (
              <nav className="flex items-center justify-center gap-3 pt-4" aria-label="Sayfalama">
                <Link
                  href={currentPage <= 2 ? `/kategori/${slug}` : `/kategori/${slug}?page=${currentPage - 1}`}
                  className={`px-4 py-2 rounded-md border text-sm ${
                    currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'
                  }`}
                  aria-disabled={currentPage === 1}
                >
                  Önceki
                </Link>
                <span className="text-sm text-gray-600">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <Link
                  href={`/kategori/${slug}?page=${currentPage + 1}`}
                  className={`px-4 py-2 rounded-md border text-sm ${
                    currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'
                  }`}
                  aria-disabled={currentPage >= totalPages}
                >
                  Sonraki
                </Link>
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
} 