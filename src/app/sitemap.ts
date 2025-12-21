import { MetadataRoute } from 'next'
import { categories } from '@/lib/categories'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
      url: `${baseUrl}/ilan-ver`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
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
  let listingPages: MetadataRoute.Sitemap = []
  try {
    const listings = await prisma.listing.findMany({
      where: {
        isActive: true,
        approvalStatus: 'approved',
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 10000, // İlk 10000 ilan
    })

    listingPages = listings.map((listing) => ({
      url: `${baseUrl}/ilan/${listing.id}`,
      lastModified: listing.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Sitemap listing error:', error)
  }

  return [...staticPages, ...categoryPages, ...subCategoryPages, ...listingPages]
}

