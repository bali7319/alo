import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { getCache, setCache, createCacheKey } from '@/lib/cache'

const Sidebar = dynamic(() => import("@/components/sidebar").then(mod => ({ default: mod.Sidebar })), {
  loading: () => <div className="w-full md:w-64 h-64 bg-gray-100 animate-pulse rounded-lg" />
})
const FeaturedAds = dynamic(() => import('@/components/featured-ads').then(mod => ({ default: mod.FeaturedAds })), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
})
const LatestAds = dynamic(() => import('@/components/latest-ads').then(mod => ({ default: mod.LatestAds })), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
})

export const revalidate = 60; // 1 dakika cache (FCP için daha sık güncelleme)
// Static generation kullan - FCP için daha hızlı

export default async function Home() {
  let featuredListings: any[] = [];
  let latestListings: any[] = [];

  try {
    // Cache key'leri oluştur
    const premiumCacheKey = createCacheKey('homepage', 'premium-listings');
    const latestCacheKey = createCacheKey('homepage', 'latest-listings');
    
    // Cache'den veri al (FCP için kritik - database query'lerini atla)
    const cachedPremium = getCache<any[]>(premiumCacheKey);
    const cachedLatest = getCache<any[]>(latestCacheKey);
    
    let premiumListings: any[] = [];
    let latest: any[] = [];
    
    if (cachedPremium && cachedLatest) {
      // Cache'den veri al - çok daha hızlı
      premiumListings = cachedPremium;
      latest = cachedLatest;
    } else {
      // Paralel query'ler ile performans iyileştirmesi - FCP için optimize edildi
      // Sadece ilk resmi çekiyoruz - performans için
      // take sayısını azalttık - FCP için daha hızlı yükleme
      [premiumListings, latest] = await Promise.all([
        prisma.listing.findMany({
          where: { isPremium: true, isActive: true, approvalStatus: 'approved', expiresAt: { gt: new Date() } },
          select: { id: true, title: true, price: true, location: true, category: true, images: true, createdAt: true, isPremium: true, views: true, user: { select: { id: true, name: true } } },
          orderBy: [{ isPremium: 'desc' }, { createdAt: 'desc' }],
          take: 4, // FCP için azaltıldı (6'dan 4'e)
        }),
        prisma.listing.findMany({
          where: { isActive: true, approvalStatus: 'approved', expiresAt: { gt: new Date() } },
          select: { id: true, title: true, price: true, location: true, category: true, images: true, createdAt: true, isPremium: true, views: true, user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 8, // FCP için azaltıldı (12'den 8'e)
        }),
      ]);
      
      // Cache'e kaydet (30 saniye TTL - FCP için)
      setCache(premiumCacheKey, premiumListings, 30000);
      setCache(latestCacheKey, latest, 30000);
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

    // Sadece ilk resmi gönder (performans için)
    featuredListings = premiumListings.map(l => {
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

  return (
    <div className="min-h-screen bg-gray-50">
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
      <section className="bg-white border-b py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse rounded-lg" />}>
            <SearchBar />
          </Suspense>
        </div>
      </section>
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
          <LatestAds title="Son Eklenen İlanlar" listings={latestListings} />
        </div>
      </div>
    </div>
  );
}
