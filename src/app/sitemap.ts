import { MetadataRoute } from 'next'
import { categories } from '@/lib/categories'
import { prisma } from '@/lib/prisma'
import { createSlug } from '@/lib/slug'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://alo17.tr'
  
  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/kategoriler`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ilanlar`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sss`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Kategori sayfaları
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/kategori/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Alt kategori sayfaları
  const subCategoryPages: MetadataRoute.Sitemap = categories.flatMap((category) =>
    (category.subcategories || []).map((subCategory) => ({
      url: `${baseUrl}/kategori/${category.slug}/${subCategory.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  )

  // İlan sayfaları (aktif ve onaylı)
  // NOT: Google sitemap limiti 50,000 URL'dir
  // Büyük siteler için sitemap index kullanılmalı
  let listingPages: MetadataRoute.Sitemap = []
  try {
    const listings = await prisma.listing.findMany({
      where: {
        isActive: true,
        approvalStatus: 'approved',
        expiresAt: {
          gt: new Date(), // Süresi dolmamış ilanlar
        },
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 10000, // Sitemap limitini artırdık (50,000'e kadar güvenli)
    })

    listingPages = listings.map((listing) => ({
      url: `${baseUrl}/ilan/${createSlug(listing.title)}`,
      lastModified: listing.updatedAt || listing.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Sitemap listing error:', error)
    // Hata durumunda boş array döndür, sitemap bozulmasın
  }

  // Tüm sayfaları birleştir
  const allPages = [
    ...staticPages,
    ...categoryPages,
    ...subCategoryPages,
    ...listingPages,
  ]

  // Sitemap limiti kontrolü (50,000 URL)
  if (allPages.length > 50000) {
    console.warn(`Sitemap çok büyük (${allPages.length} URL). Sitemap index kullanmayı düşünün.`)
    // İlk 50,000'i döndür
    return allPages.slice(0, 50000)
  }

  return allPages
}

