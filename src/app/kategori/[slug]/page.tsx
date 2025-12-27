import { categories } from '@/lib/categories'
import { Sidebar } from '@/components/sidebar'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import Link from 'next/link'
import { Home, Sparkles, Star, MapPin, Users, Clock, Shield, Award } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'

// Cache eklendi - performans için kritik
export const revalidate = 300; // 5 dakika cache
export const dynamic = 'force-dynamic'; // Her istekte fresh data (cache ile birlikte çalışır)

// Timeout wrapper - 8 saniye içinde cevap vermezse hata döndür
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
  const params: { slug: string }[] = [];
  
  // Tüm kategoriler için statik parametreler oluştur
  categories.forEach((category) => {
    params.push({
      slug: category.slug,
    });
  });
  
  return params;
}

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const foundCategory = categories.find((cat) => cat.slug === slug);
  
  if (!foundCategory) {
    return {
      title: 'Kategori Bulunamadı',
    };
  }

  const categoryMap: { [key: string]: string } = {
    'is': 'İş',
    'hizmetler': 'Hizmetler',
    'elektronik': 'Elektronik',
    'ev-ve-bahce': 'Ev & Bahçe',
    'giyim': 'Giyim',
    'moda-stil': 'Moda & Stil',
    'sporlar-oyunlar-eglenceler': 'Sporlar, Oyunlar ve Eğlenceler',
    'anne-bebek': 'Anne & Bebek',
    'cocuk-dunyasi': 'Çocuk Dünyası',
    'egitim-kurslar': 'Eğitim & Kurslar',
    'yemek-icecek': 'Yemek & İçecek',
    'catering-ticaret': 'Catering & Ticaret',
    'turizm-konaklama': 'Turizm & Konaklama',
    'saglik-guzellik': 'Sağlık & Güzellik',
    'sanat-hobi': 'Sanat & Hobi',
    'ucretsiz-gel-al': 'Ücretsiz Gel Al'
  };

  const categoryName = categoryMap[slug] || foundCategory.name;
  
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

  const title = `${categoryName} İlanları - Çanakkale | Alo17`;
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
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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

  // Diğer kategoriler
  const otherCategories = categories.filter((cat) => cat.slug !== slug)

  // Kategori slug'ını kategori adına çevir
  const categoryMap: { [key: string]: string } = {
    'is': 'İş',
    'hizmetler': 'Hizmetler',
    'elektronik': 'Elektronik',
    'ev-ve-bahce': 'Ev & Bahçe',
    'giyim': 'Giyim',
    'moda-stil': 'Moda & Stil',
    'sporlar-oyunlar-eglenceler': 'Sporlar, Oyunlar ve Eğlenceler',
    'anne-bebek': 'Anne & Bebek',
    'cocuk-dunyasi': 'Çocuk Dünyası',
    'egitim-kurslar': 'Eğitim & Kurslar',
    'yemek-icecek': 'Yemek & İçecek',
    'catering-ticaret': 'Catering & Ticaret',
    'turizm-konaklama': 'Turizm & Konaklama',
    'saglik-guzellik': 'Sağlık & Güzellik',
    'sanat-hobi': 'Sanat & Hobi',
    'ucretsiz-gel-al': 'Ücretsiz Gel Al'
  };

  const categoryName = categoryMap[slug];

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
  // PERFORMANS: Sadece ilk 100 ilanı çek (sayfa yüklenmesi için yeterli)
  let listings: any[] = [];
  try {
    listings = await withTimeout(
      prisma.listing.findMany({
        where: {
          OR: [
            { category: slug }, // Slug formatında (örn: "elektronik")
            { category: categoryName }, // Tam kategori adı formatında (örn: "Elektronik")
          ],
          isActive: true,
          approvalStatus: 'approved',
          expiresAt: {
            gt: new Date() // Süresi dolmamış ilanlar
          }
        },
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          category: true,
          subCategory: true,
          description: true, // Kısaltılacak
          images: true, // Resimleri çek
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
              // email: true, // Gereksiz
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
    console.error('Kategori ilanları getirme hatası:', error);
    console.warn('Database connection failed during build, using empty listings');
    listings = []; // Boş liste döndür
  }

  const formattedListings = listings.map(listing => {
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
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{foundCategory.name}</span>
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
                <span className="mr-3 text-2xl">{typeof foundCategory.icon === 'string' ? foundCategory.icon : '•'}</span>
                {foundCategory.name}
              </h1>
              <p className="text-gray-600">
                {foundCategory.name} kategorisinde en iyi ürünleri ve hizmetleri keşfedin.
              </p>
            </div>

            <section>
              <FeaturedAds 
                title={`Öne Çıkan ${foundCategory.name}`}
                category={foundCategory.slug} 
                listings={formattedListings} 
              />
            </section>
            
            <section>
              <LatestAds 
                title={`Son Eklenen ${foundCategory.name}`}
                category={foundCategory.slug} 
                listings={formattedListings} 
              />
            </section>
          </div>
        </div>
      </div>
    </main>
  )
} 