import nextDynamic from 'next/dynamic'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeaturedAds } from '@/components/featured-ads'
import { LatestAds } from '@/components/latest-ads'
import type { Listing } from '@/types/listings'

const Sidebar = nextDynamic(
  () => import('@/components/sidebar').then((mod) => ({ default: mod.Sidebar })),
  { loading: () => <div className="w-full md:w-64 h-64 bg-gray-100 animate-pulse rounded-lg" /> }
)

const PREMIUM_TAKE = 60
const LATEST_TAKE = 60

function seededShuffle<T>(array: T[], seed: string): T[] {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  const shuffled = [...array]
  const random = () => {
    hash = (hash * 9301 + 49297) % 233280
    return hash / 233280
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function makeMockListing(id: string, overrides: Partial<Listing> = {}): Listing {
  return {
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
  }
}

export async function HomeListingsSection() {
  const todaySeed = new Date().toISOString().slice(0, 10)
  let featuredListings: Listing[] = []
  let latestListings: Listing[] = []

  const safeParseImages = (images: string | null): string[] => {
    if (!images) return []
    try {
      if (typeof images === 'string') {
        if (images.startsWith('data:image')) return [images]
        const parsed = JSON.parse(images)
        return Array.isArray(parsed) ? parsed : []
      }
      return Array.isArray(images) ? images : []
    } catch {
      return []
    }
  }

  const useMock = () => {
    featuredListings = [
      makeMockListing('demo-premium-1', { title: 'Öne Çıkan Örnek İlan 1', isPremium: true, price: '1500', category: 'Elektronik', location: 'Merkez' }),
      makeMockListing('demo-premium-2', { title: 'Öne Çıkan Örnek İlan 2', isPremium: true, price: '0', category: 'Hizmetler', location: 'Kepez' }),
      makeMockListing('demo-premium-3', { title: 'Öne Çıkan Örnek İlan 3', isPremium: true, price: '750', category: 'Ev & Bahçe', location: 'Biga' }),
    ]
    latestListings = [
      makeMockListing('demo-latest-1', { title: 'Tüm İlanlar Örnek 1', price: '250', category: 'Giyim', location: 'Merkez' }),
      makeMockListing('demo-latest-2', { title: 'Tüm İlanlar Örnek 2', price: '0', category: 'Ücretsiz Gel Al', location: 'Kepez' }),
      makeMockListing('demo-latest-3', { title: 'Tüm İlanlar Örnek 3', price: '1200', category: 'Elektronik', location: 'Çan' }),
      makeMockListing('demo-latest-4', { title: 'Tüm İlanlar Örnek 4', price: '500', category: 'Sanat & Hobi', location: 'Ayvacık' }),
      makeMockListing('demo-latest-5', { title: 'Tüm İlanlar Örnek 5', price: '0', category: 'Hizmetler', location: 'Gelibolu' }),
      makeMockListing('demo-latest-6', { title: 'Tüm İlanlar Örnek 6', price: '99', category: 'Yemek & İçecek', location: 'Lapseki' }),
    ]
  }

  try {
    const dbUrl = process.env.DATABASE_URL || ''
    const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')
    if (!isPostgres) {
      if (process.env.NODE_ENV !== 'production') useMock()
      throw new Error('__SKIP_DB__')
    }

    const { prisma } = await import('@/lib/prisma')
    const nowForDb = new Date()

    const [premiumListingsRaw, latest] = await Promise.all([
      prisma.listing.findMany({
        where: {
          isActive: true,
          approvalStatus: 'approved',
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
          user: { select: { id: true, name: true } },
        },
        orderBy: [{ premiumUntil: 'desc' }, { createdAt: 'desc' }],
        take: PREMIUM_TAKE,
      }),
      prisma.listing.findMany({
        where: {
          isActive: true,
          approvalStatus: 'approved',
          expiresAt: { gt: nowForDb },
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
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: LATEST_TAKE,
      }),
    ])

    const validPremium = premiumListingsRaw.filter((l) => l != null)
    const shuffledPremium = seededShuffle(validPremium, todaySeed)

    featuredListings = shuffledPremium.map((l) => {
      const parsedImages = safeParseImages(l.images)
      const firstImage = parsedImages.length > 0 ? [parsedImages[0]] : []
      return {
        id: l.id,
        title: l.title,
        price: l.price,
        location: l.location,
        category: l.category,
        images: firstImage,
        description: '',
        createdAt: l.createdAt.toISOString(),
        isPremium: l.isPremium,
        user: {
          id: l.user?.id || '',
          name: l.user?.name || null,
        },
      }
    })

    latestListings = latest.map((l) => {
      const parsedImages = safeParseImages(l.images)
      const firstImage = parsedImages.length > 0 ? [parsedImages[0]] : []
      return {
        id: l.id,
        title: l.title,
        price: l.price,
        location: l.location,
        category: l.category,
        images: firstImage,
        description: '',
        createdAt: l.createdAt.toISOString(),
        isPremium: l.isPremium,
        user: {
          id: l.user?.id || '',
          name: l.user?.name || null,
        },
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production' && featuredListings.length === 0 && latestListings.length === 0) {
      useMock()
    }
    if (error instanceof Error && error.message !== '__SKIP_DB__') {
      console.error('Database error (HomeListingsSection):', error)
    }
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="mb-4">
          <Button
            asChild
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold shadow-lg"
            size="lg"
          >
            <Link href="/sozlesmeler" className="block">
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Hukuki Belgeler ve Dilekçe
            </Link>
          </Button>
        </div>
        <div className="mb-4">
          <Button
            asChild
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold shadow-lg"
            size="lg"
          >
            <Link href="/ilan-ver" className="block">
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Reklam Ver
            </Link>
          </Button>
        </div>
        <Sidebar />
      </div>
      <div className="flex-1 space-y-8">
        <FeaturedAds title="Öne Çıkan İlanlar" listings={featuredListings} limit={3} />
        <LatestAds title="Tüm İlanlar" listings={latestListings} />
        <div className="pt-2">
          <Button asChild variant="outline">
            <Link href="/ilanlar" className="inline-flex">
              Tüm ilanları /ilanlar sayfasında gör
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
