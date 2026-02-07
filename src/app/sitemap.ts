import { MetadataRoute } from 'next'
import { categories } from '@/lib/categories'
import { prisma } from '@/lib/prisma'
import { createListingSlug } from '@/lib/slug'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://alo17.tr'
  const DEBUG = process.env.NODE_ENV !== 'production' || process.env.DEBUG_SITEMAP === 'true'
  
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
    {
      url: `${baseUrl}/ilan-ver`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/yardim`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/premium`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ilan-verme-kurallari`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/gizlilik`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/kvkk`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/cerez-politikasi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/kullanim-kosullari`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/kariyer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sozlesmeler`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sozlesmeler/ev-kiralama`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.45,
    },
    {
      url: `${baseUrl}/kampanyalar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/social`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/yeni-urunler`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.4,
    },
  ]

  // Kategori sayfaları
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/kategori/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Alt kategori sayfaları (2. seviye)
  const subCategoryPages: MetadataRoute.Sitemap = categories.flatMap((category) =>
    (category.subcategories || []).map((subCategory) => ({
      url: `${baseUrl}/kategori/${category.slug}/${subCategory.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  )

  // Alt-alt kategori sayfaları (3. seviye) - SEO dizin sorunlarını azaltmak için
  const subSubCategoryPages: MetadataRoute.Sitemap = categories.flatMap((category) =>
    (category.subcategories || []).flatMap((subCategory) =>
      (subCategory.subcategories || []).map((subSubCategory) => ({
        url: `${baseUrl}/kategori/${category.slug}/${subCategory.slug}/${subSubCategory.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.65,
      }))
    )
  )

  // Sözleşme tipi sayfaları (/sozlesmeler/[id] - ev-kiralama ayrı route olduğu için hariç)
  let contractTypePages: MetadataRoute.Sitemap = []
  try {
    const { contractTemplates } = await import('@/lib/contract-templates')
    const contractSlugs = Object.keys(contractTemplates || {}).filter((id) => id !== 'ev-kiralama')
    contractTypePages = contractSlugs.map((id) => ({
      url: `${baseUrl}/sozlesmeler/${id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    }))
  } catch (err) {
    if (DEBUG) console.error('Sitemap contract types error:', err)
  }

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
      // Canonical listing URL includes stable ID to avoid duplicates.
      url: `${baseUrl}/ilan/${createListingSlug(listing.title, listing.id)}`,
      lastModified: listing.updatedAt || listing.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    if (DEBUG) {
      console.error('Sitemap listing error:', error)
    } else {
      console.warn('[sitemap] listing query failed; returning without listing URLs')
    }
    // Hata durumunda boş array döndür, sitemap bozulmasın
  }

  // Tüm sayfaları birleştir
  const allPages = [
    ...staticPages,
    ...categoryPages,
    ...subCategoryPages,
    ...subSubCategoryPages,
    ...contractTypePages,
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

