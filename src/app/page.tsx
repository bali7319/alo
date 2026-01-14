import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import IlanlarimButton from '@/components/ilanlarim-button'

// Dynamic imports - Lazy loading için (FCP optimizasyonu)
const Sidebar = dynamic(
  () => import("@/components/sidebar").then(mod => ({ default: mod.Sidebar })),
  {
    loading: () => <div className="w-full md:w-64 h-64 bg-gray-100 animate-pulse rounded-lg" />
  }
)

const FeaturedAds = dynamic(
  () => import('@/components/featured-ads').then(mod => ({ default: mod.FeaturedAds })),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
  }
)

const LatestAds = dynamic(
  () => import('@/components/latest-ads').then(mod => ({ default: mod.LatestAds })),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
  }
)

// Ana sayfayı dynamic yap - Her istekte fresh data çek (tüm ilanlar için)
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Cache yok - Her zaman fresh data

// Günlük rotasyon için seed'li shuffle fonksiyonu
function seededShuffle<T>(array: T[], seed: string): T[] {
  // Seed'den basit bir hash oluştur
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit integer'a çevir
  }
  
  // Fisher-Yates shuffle algoritması (seed'li)
  const shuffled = [...array];
  const random = () => {
    hash = ((hash * 9301) + 49297) % 233280;
    return hash / 233280;
  };
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

export default async function Home() {
  let featuredListings: any[] = [];
  let latestListings: any[] = [];

  try {
    // Her istekte farklı rotasyon için timestamp + random seed kullan
    const now = new Date();
    const timestamp = now.getTime();
    const randomSeed = Math.floor(Math.random() * 1000000);
    const rotationSeed = `${timestamp}-${randomSeed}`;
    
    // Cache'i devre dışı bırak - Her zaman fresh data çek
    // Paralel query'ler ile performans iyileştirmesi
    // TÜM ilanları çek (limit yok)
    const [premiumListingsRaw, latest] = await Promise.all([
      prisma.listing.findMany({
        where: { 
          isPremium: true, 
          isActive: true, 
          approvalStatus: 'approved',
          OR: [
            { expiresAt: { gt: new Date() } },
            { expiresAt: null } // Süresi belirtilmemiş ilanlar da dahil
          ]
        },
        select: { 
          id: true, 
          title: true, 
          price: true, 
          location: true, 
          category: true, 
          images: true, 
          createdAt: true, 
          isPremium: true, 
          views: true, 
          user: { 
            select: { id: true, name: true } 
          } 
        },
        orderBy: [{ isPremium: 'desc' }, { createdAt: 'desc' }],
        // Limit yok - Tüm premium ilanlar
      }),
      prisma.listing.findMany({
        where: { 
          isActive: true, 
          approvalStatus: 'approved',
          OR: [
            { expiresAt: { gt: new Date() } },
            { expiresAt: null } // Süresi belirtilmemiş ilanlar da dahil
          ]
        },
        select: { 
          id: true, 
          title: true, 
          price: true, 
          location: true, 
          category: true, 
          images: true, 
          createdAt: true, 
          isPremium: true, 
          views: true, 
          user: { 
            select: { id: true, name: true } 
          } 
        },
        orderBy: { createdAt: 'desc' },
        // Limit yok - Tüm ilanlar
      }),
    ]);
    
    console.log(`[Ana Sayfa] Premium ilan sayısı: ${premiumListingsRaw.length}`);
    console.log(`[Ana Sayfa] Toplam ilan sayısı: ${latest.length}`);
    
    // Debug: Filtreler olmadan toplam ilan sayısını kontrol et
    const totalWithoutFilters = await prisma.listing.count();
    const totalActive = await prisma.listing.count({ where: { isActive: true } });
    const totalApproved = await prisma.listing.count({ where: { isActive: true, approvalStatus: 'approved' } });
    const totalNotExpired = await prisma.listing.count({ 
      where: { 
        isActive: true, 
        approvalStatus: 'approved', 
        expiresAt: { gt: new Date() } 
      } 
    });
    console.log(`[Ana Sayfa Debug] Toplam ilan (filtresiz): ${totalWithoutFilters}`);
    console.log(`[Ana Sayfa Debug] Aktif ilan: ${totalActive}`);
    console.log(`[Ana Sayfa Debug] Onaylı ilan: ${totalApproved}`);
    console.log(`[Ana Sayfa Debug] Süresi dolmamış ilan: ${totalNotExpired}`);
    
    // Her istekte premium ilanları farklı rotasyon ile karıştır
    // Undefined/null ilanları filtrele
    const validPremiumListings = premiumListingsRaw.filter(l => l != null);
    const shuffledPremium = seededShuffle(validPremiumListings, rotationSeed);
    // Tüm premium ilanları göster (rotasyon ile karıştırılmış)
    const premiumListings = shuffledPremium;

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

    // Sadece ilk resmi gönder (performans için)
    // Güvenlik için tekrar filtrele
    featuredListings = premiumListings.filter(l => l != null).map(l => {
      const parsedImages = safeParseImages(l.images);
      const firstImage = parsedImages.length > 0 ? [parsedImages[0]] : [];
      return {
        id: l.id,
        title: l.title,
        price: l.price,
        location: l.location,
        category: l.category,
        images: firstImage,
        description: "",
        createdAt: l.createdAt.toISOString(),
        isPremium: l.isPremium,
        views: l.views || 0,
        user: {
          id: l.user?.id || '',
          name: l.user?.name || null,
        }
      };
    });
    
    latestListings = latest.map(l => {
      const parsedImages = safeParseImages(l.images);
      const firstImage = parsedImages.length > 0 ? [parsedImages[0]] : [];
      return {
        id: l.id,
        title: l.title,
        price: l.price,
        location: l.location,
        category: l.category,
        images: firstImage,
        description: "",
        createdAt: l.createdAt.toISOString(),
        isPremium: l.isPremium,
        views: l.views || 0,
        user: {
          id: l.user?.id || '',
          name: l.user?.name || null,
        }
      };
    });
  } catch (error) {
    console.error('Database error:', error);
  }

  // Above-the-fold content'i önce render et (FCP için kritik)
  // Streaming SSR ile sayfanın ilk kısmı hemen gösterilir
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Above-the-fold: Hero section - FCP için kritik */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 sm:py-8 md:py-16">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Ücretsiz İlan Platformu</h1>
          <div className="mt-4 sm:mt-6">
            <Button 
              asChild
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Link href="/ilan-ver" className="inline-flex items-center" prefetch={true}>
                <Plus className="h-5 w-5 mr-2" />
                İlan Ver
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Search bar - Above-the-fold */}
      <section className="bg-white border-b py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse rounded-lg" />}>
            <SearchBar />
          </Suspense>
        </div>
      </section>
      {/* Below-the-fold: Sidebar ve listings - Lazy load */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          {/* Hukuki Belgeler ve Dilekçe Butonu */}
          <div className="mb-4">
            <Link href="/sozlesmeler" className="block">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold shadow-lg"
                size="lg"
              >
                <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Hukuki Belgeler ve Dilekçe
              </Button>
            </Link>
          </div>
          {/* İlanlarım Butonu - Sadece giriş yapılmış kullanıcılar için */}
          <Suspense fallback={null}>
            <IlanlarimButton />
          </Suspense>
          {/* Reklam Ver Butonu - Kategorilerin Üstünde */}
          <div className="mb-4">
            <Link href="/ilan-ver" className="block">
              <Button 
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold shadow-lg"
                size="lg"
              >
                <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Reklam Ver
              </Button>
            </Link>
          </div>
          <Sidebar />
        </div>
        <div className="flex-1 space-y-8">
          <FeaturedAds title="Öne Çıkan İlanlar" listings={featuredListings} />
          <LatestAds title="Tüm İlanlar" listings={latestListings} />
        </div>
      </div>
    </div>
  );
}
