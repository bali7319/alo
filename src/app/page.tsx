import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'

const Sidebar = dynamic(() => import("@/components/sidebar").then(mod => ({ default: mod.Sidebar })), {
  loading: () => <div className="w-full md:w-64 h-64 bg-gray-100 animate-pulse rounded-lg" />
})
const FeaturedAds = dynamic(() => import('@/components/featured-ads').then(mod => ({ default: mod.FeaturedAds })), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
})
const LatestAds = dynamic(() => import('@/components/latest-ads').then(mod => ({ default: mod.LatestAds })), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
})

export const revalidate = 300; // 5 dakika cache (performans için)

export default async function Home() {
  let featuredListings: any[] = [];
  let latestListings: any[] = [];

  try {
    // Paralel query'ler ile performans iyileştirmesi
    // Sadece ilk resmi çekiyoruz - performans için
    const [premiumListings, latest] = await Promise.all([
      prisma.listing.findMany({
        where: { isPremium: true, isActive: true, approvalStatus: 'approved', expiresAt: { gt: new Date() } },
        select: { id: true, title: true, price: true, location: true, category: true, images: true, createdAt: true, isPremium: true, views: true, user: { select: { id: true, name: true } } },
        orderBy: [{ isPremium: 'desc' }, { createdAt: 'desc' }],
        take: 6,
      }),
      prisma.listing.findMany({
        where: { isActive: true, approvalStatus: 'approved', expiresAt: { gt: new Date() } },
        select: { id: true, title: true, price: true, location: true, category: true, images: true, createdAt: true, isPremium: true, views: true, user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
    ]);

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
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">Ücretsiz İlan Platformu</h1>
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
