import type { Metadata } from 'next'
import nextDynamic from 'next/dynamic'
import Link from 'next/link'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import { WhyUsHero } from '@/components/home/WhyUsHero'
import { AdvantageBand } from '@/components/home/AdvantageBand'
import { DifferenceInline } from '@/components/home/DifferenceSidebar'
import { CityStory } from '@/components/home/CityStory'
import type { Listing } from '@/types/listings'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

// Dynamic imports - Lazy loading için (FCP optimizasyonu)
const Sidebar = nextDynamic(
  () => import("@/components/sidebar").then(mod => ({ default: mod.Sidebar })),
  {
    loading: () => <div className="w-full md:w-64 h-64 bg-gray-100 animate-pulse rounded-lg" />
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
  let featuredListings: Listing[] = [];
  let latestListings: Listing[] = [];

  const makeMockListing = (id: string, overrides: Partial<Listing> = {}): Listing => ({
    id,
    title: 'Örnek İlan',
    description: '',
    price: '0',
    location: 'Çanakkale',
    category: 'Genel',
    images: [],
    isPremium: false,
    createdAt: new Date().toISOString(),
    user: { id: 'demo', email: 'demo@alo17.tr', name: 'Alo17' },
    ...overrides,
  });

  const useMock = () => {
    // UI düzenleme/dev için: DB yoksa sayfa boş kalmasın.
    featuredListings = [
      makeMockListing('demo-premium-1', { title: 'Öne Çıkan Örnek İlan 1', isPremium: true, planName: 'Premium', price: '1500', category: 'Elektronik', location: 'Merkez' }),
      makeMockListing('demo-premium-2', { title: 'Öne Çıkan Örnek İlan 2', isPremium: true, planName: 'Premium', price: '0', category: 'Hizmetler', location: 'Kepez' }),
      makeMockListing('demo-premium-3', { title: 'Öne Çıkan Örnek İlan 3', isPremium: true, planName: 'Premium', price: '750', category: 'Ev & Bahçe', location: 'Biga' }),
    ];
    latestListings = [
      makeMockListing('demo-latest-1', { title: 'Tüm İlanlar Örnek 1', price: '250', category: 'Giyim', location: 'Merkez' }),
      makeMockListing('demo-latest-2', { title: 'Tüm İlanlar Örnek 2', price: '0', category: 'Ücretsiz Gel Al', location: 'Kepez' }),
      makeMockListing('demo-latest-3', { title: 'Tüm İlanlar Örnek 3', price: '1200', category: 'Elektronik', location: 'Çan' }),
      makeMockListing('demo-latest-4', { title: 'Tüm İlanlar Örnek 4', price: '500', category: 'Sanat & Hobi', location: 'Ayvacık' }),
      makeMockListing('demo-latest-5', { title: 'Tüm İlanlar Örnek 5', price: '0', category: 'Hizmetler', location: 'Gelibolu' }),
      makeMockListing('demo-latest-6', { title: 'Tüm İlanlar Örnek 6', price: '99', category: 'Yemek & İçecek', location: 'Lapseki' }),
    ];
  };

  try {
    const dbUrl = process.env.DATABASE_URL || '';
    const isPostgresUrl = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

    // Local/dev: DATABASE_URL yanlışsa Prisma daha query aşamasında patlar (schema provider postgresql).
    // UI geliştirmeyi bloklamamak için mock fallback kullan.
    if (!isPostgresUrl) {
      if (process.env.NODE_ENV !== 'production') {
        useMock();
        console.warn(
          'DATABASE_URL is not a postgres URL (expected postgresql:// or postgres://). Using mock listings for local UI.'
        );
      }
      // Skip DB queries
      throw new Error('__SKIP_DB__');
    }

    const { prisma } = await import('@/lib/prisma');

    // Her istekte farklı rotasyon için timestamp + random seed kullan
    const now = new Date();
    const timestamp = now.getTime();
    const randomSeed = Math.floor(Math.random() * 1000000);
    const rotationSeed = `${timestamp}-${randomSeed}`;
    
    // Not: "tüm ilanları" tek seferde çekmek üretimde timeout/performans sorunlarına yol açabilir.
    // Ana sayfada yüksek ama makul limit kullanıyoruz; tam liste için /ilanlar.
    // Premium sayısı artarsa eski premiumlar da düşmesin diye biraz yüksek tutuyoruz.
    const PREMIUM_TAKE = 1000;
    const LATEST_TAKE = 500;
    const nowForDb = new Date();

    const [premiumListingsRaw, latest] = await Promise.all([
      prisma.listing.findMany({
        where: { 
          isActive: true, 
          approvalStatus: 'approved',
          // Premium'u belirle: isPremium=true veya premiumUntil devam ediyor
          // Görünürlük: expiresAt geçmiş olsa bile premiumUntil devam ediyorsa göster
          AND: [
            { OR: [{ isPremium: true }, { premiumUntil: { gt: nowForDb } }] },
            { OR: [{ expiresAt: { gt: nowForDb } }, { premiumUntil: { gt: nowForDb } }] },
          ],
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
          user: { 
            select: { id: true, name: true } 
          } 
        },
        orderBy: [
          { premiumUntil: 'desc' },
          { createdAt: 'desc' },
        ],
        take: PREMIUM_TAKE,
      }),
      prisma.listing.findMany({
        where: { 
          isActive: true, 
          approvalStatus: 'approved',
          expiresAt: { gt: nowForDb }
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
          user: { 
            select: { id: true, name: true } 
          } 
        },
        orderBy: { createdAt: 'desc' },
        take: LATEST_TAKE,
      }),
    ]);
    
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
        user: {
          id: l.user?.id || '',
          name: l.user?.name || null,
        }
      };
    });
  } catch (error) {
    // Sadece local/dev'de DB yokken UI boş kalmasın diye mock'a düş.
    // Production'da mock göstermek yanıltıcı olduğu için boş liste + log tercih ediyoruz.
    if (process.env.NODE_ENV !== 'production' && featuredListings.length === 0 && latestListings.length === 0) {
      useMock();
    }
    // "__SKIP_DB__" is intentional when local DB isn't configured.
    if (error instanceof Error && error.message === '__SKIP_DB__') {
      // no-op
    } else {
      console.error('Database error (Home):', error);
    }
  }

  // Above-the-fold content'i önce render et (FCP için kritik)
  // Streaming SSR ile sayfanın ilk kısmı hemen gösterilir
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search bar - Above-the-fold */}
      <section className="bg-white border-b py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse rounded-lg" />}>
            <SearchBar />
          </Suspense>

          {/* CTA: İlan Ver (Search bar altı) */}
          <div className="mt-4 flex justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold shadow-lg"
            >
              <Link href="/ilan-ver">İlan Ver</Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Hero (welcome) - right after logos/search, before listings */}
      <WhyUsHero />
      <section className="container mx-auto px-3 sm:px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <DifferenceInline />
        </div>
      </section>
      <section className="container mx-auto px-3 sm:px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <AdvantageBand />
        </div>
      </section>
      {/* Below-the-fold: Sidebar ve listings - Lazy load */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
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
          <FeaturedAds title="Öne Çıkan İlanlar" listings={featuredListings} limit={3} />
          <LatestAds title="Tüm İlanlar" listings={latestListings} />
          <div className="pt-2">
            <Link href="/ilanlar" className="inline-flex">
              <Button variant="outline">Tüm ilanları /ilanlar sayfasında gör</Button>
            </Link>
          </div>
        </div>
      </div>
      {/* Footer-top story section */}
      <CityStory />
    </div>
  );
}
