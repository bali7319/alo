import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ListingCard } from '@/components/listing-card'
import { Shield, Camera, Bell, CreditCard, Fingerprint } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Güvenlik Hizmetleri - Alo17',
  description: 'Güvenlik görevlisi, güvenlik sistemleri, kamera sistemleri, alarm sistemleri ve daha fazlası',
}

const subSubcategories = [
  {
    name: 'Güvenlik Görevlisi',
    icon: Shield,
    slug: 'guvenlik-gorevlisi',
    description: 'Deneyimli güvenlik görevlileri ve güvenlik hizmetleri'
  },
  {
    name: 'Güvenlik Sistemi',
    icon: Camera,
    slug: 'guvenlik-sistemi',
    description: 'Ev ve işyeri güvenlik sistemleri'
  },
  {
    name: 'Kamera Sistemleri',
    icon: Camera,
    slug: 'kamera-sistemleri',
    description: 'IP kamera ve dome kamera sistemleri'
  },
  {
    name: 'Alarm Sistemleri',
    icon: Bell,
    slug: 'alarm-sistemleri',
    description: 'Kablosuz ve merkezi bağlantılı alarm sistemleri'
  },
  {
    name: 'Kartlı Geçiş',
    icon: CreditCard,
    slug: 'kartli-gecis',
    description: 'RFID kartlı geçiş sistemleri'
  },
  {
    name: 'Parmak İzi Sistemleri',
    icon: Fingerprint,
    slug: 'parmak-izi-sistemleri',
    description: 'Parmak izi okuyucu ve hibrit sistemler'
  }
]

async function getListings() {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        category: 'hizmetler',
        subCategory: 'guvenlik',
        approvalStatus: 'APPROVED',
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Prisma verisini Listing tipine dönüştür
    return listings.map(listing => ({
      ...listing,
      subCategory: listing.subCategory || undefined,
      subSubCategory: listing.subSubCategory || undefined,
      images: listing.images ? JSON.parse(listing.images) : [],
      features: listing.features ? JSON.parse(listing.features) : [],
      premiumUntil: listing.premiumUntil ? listing.premiumUntil.toISOString() : undefined,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      expiresAt: listing.expiresAt.toISOString(),
      phone: listing.phone || undefined,
      user: {
        id: listing.userId,
        name: listing.user?.name || 'Bilinmeyen Kullanıcı',
        email: ''
      }
    }));
  } catch (error) {
    console.error('Güvenlik ilanları yüklenirken hata:', error);
    return [];
  }
}

export default async function GuvenlikPage() {
  const listings = await getListings()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-alo-orange mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Güvenlik Hizmetleri</h1>
          </div>
          <p className="text-lg text-gray-600">
            Güvenlik görevlisi, güvenlik sistemleri, kamera sistemleri ve daha fazlası
          </p>
        </div>

        {/* Alt Kategoriler */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alt Kategoriler</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {subSubcategories.map((subcategory) => (
              <a
                key={subcategory.slug}
                href={`/kategori/hizmetler/guvenlik/${subcategory.slug}`}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex flex-col items-center text-center">
                  <subcategory.icon className="h-8 w-8 text-alo-orange mb-2" />
                  <h3 className="font-medium text-gray-900 text-sm">{subcategory.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{subcategory.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* İlanlar */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tüm Güvenlik İlanları ({listings.length})
          </h2>
          
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz ilan yok</h3>
              <p className="text-gray-500">Bu kategoride henüz ilan bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 

