import { Suspense } from 'react';
import IlanDetayClient from './IlanDetayClient';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { createSlug, createListingSlug, extractIdFromSlug } from '@/lib/slug';
import { getSeoSettings } from '@/lib/seo-settings';
import SeoJsonLd from '@/components/SeoJsonLd'
import { cache } from 'react'
import { notFound, permanentRedirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>;
}

// İlan detayları SEO ve performans için cache'lenebilir (ISR).
// Next, listing data update hızına göre bu değer ayarlanabilir.
export const revalidate = 300;

// Timeout wrapper - 8 saniye içinde cevap vermezse hata döndür
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

const getListingForSeo = cache(async (slugOrId: string) => {
  // Slug'dan ID çıkarmayı dene, yoksa slug olarak kabul et
  const possibleId = extractIdFromSlug(slugOrId);

  let listing: any;
  if (possibleId) {
    listing = await withTimeout(
      prisma.listing.findUnique({
        where: { id: possibleId },
        include: {
          user: {
            select: {
              name: true,
              location: true,
            },
          },
        },
      }),
      5000
    );
  } else {
    const keywords = slugOrId
      .split('-')
      .filter(word => word.length > 1)
      .slice(0, 10);

    if (keywords.length >= 1) {
      const importantKeywords = keywords.slice(0, 3);
      const candidates = await withTimeout(
        prisma.listing.findMany({
          where: {
            isActive: true,
            approvalStatus: 'approved',
            OR: importantKeywords.map(keyword => ({
              title: {
                contains: keyword,
              },
            })),
          },
          select: {
            id: true,
            title: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 200,
        }),
        3000
      );

      listing = candidates.find(l => createSlug(l.title) === slugOrId);
    }

    if (!listing) {
      const recentListings = await withTimeout(
        prisma.listing.findMany({
          where: {
            isActive: true,
            approvalStatus: 'approved'
          },
          select: {
            id: true,
            title: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 500,
        }),
        3000
      );

      listing = recentListings.find(l => createSlug(l.title) === slugOrId);
    }

    if (listing) {
      listing = await withTimeout(
        prisma.listing.findUnique({
          where: { id: listing.id },
          include: {
            user: {
              select: {
                name: true,
                location: true,
              },
            },
          },
        }),
        3000
      );
    }
  }

  return listing;
});

// SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: slugOrId } = await params;
  
  try {
    const listing = await getListingForSeo(slugOrId);

    if (!listing || !listing.isActive || listing.approvalStatus !== 'approved') {
      return {
        title: 'İlan Bulunamadı',
        description: 'Aradığınız ilan bulunamadı veya yayından kaldırılmış olabilir.',
        robots: { index: false, follow: false },
      };
    }

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
    const images = safeParseImages(listing.images);
    const firstImage = images[0] || '/images/logo.svg';
    const price = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(listing.price);

    const canonicalSegment = createListingSlug(listing.title, listing.id);
    
    // SEO optimized title - İlan başlığı otomatik kullanılıyor
    const title = `${listing.title} - ${price} | ${listing.category} | Alo17 Çanakkale`;
    
    // SEO optimized description - İlan açıklaması ve başlığı kullanılıyor
    const descriptionText = listing.description 
      ? listing.description.substring(0, 150).trim()
      : `${listing.title} - ${listing.category} kategorisinde satılık ilan`;
    const description = `${descriptionText}... ${listing.location}, Çanakkale. Fiyat: ${price}. Alo17'de güvenli alışveriş.`;
    
    // SEO-friendly URL - İlan başlığından slug oluştur (sadece slug)
    const canonicalUrl = `https://alo17.tr/ilan/${canonicalSegment}`;

    // Keywords array'ini oluştur - undefined değerleri ekleme
    const keywords: string[] = [
      listing.title.toLowerCase(),
      `${listing.title.toLowerCase()} çanakkale`,
      listing.category.toLowerCase(),
      `${listing.category.toLowerCase()} çanakkale`,
      listing.location.toLowerCase(),
      'çanakkale',
      'ikinci el',
      'satılık',
      `satılık ${listing.category.toLowerCase()}`,
      'alo17',
      'alo17 çanakkale',
    ];
    
    // SubCategory varsa ekle
    if (listing.subCategory) {
      keywords.push(listing.subCategory.toLowerCase());
    }

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'Alo17',
        locale: 'tr_TR',
        type: 'website',
        images: [
          {
            url: firstImage.startsWith('http') ? firstImage : `https://alo17.tr${firstImage}`,
            width: 1200,
            height: 630,
            alt: listing.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [firstImage.startsWith('http') ? firstImage : `https://alo17.tr${firstImage}`],
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (error) {
    return {
      title: 'İlan Detayı',
      description: 'İlan detay sayfası',
      robots: { index: false, follow: false },
    };
  }
}

export default async function IlanDetayPage({ params }: PageProps) {
  const { id: slugOrId } = await params;
  const [seo, listing] = await Promise.all([
    getSeoSettings(),
    getListingForSeo(slugOrId),
  ]);

  if (!listing) {
    notFound();
  }

  const canonicalSegment = createListingSlug(listing.title, listing.id);

  // Consolidate all variants (id-only, slug-only, wrong slug) into a single canonical URL.
  if (slugOrId !== canonicalSegment) {
    permanentRedirect(`/ilan/${canonicalSegment}`);
  }

  const safeParseImages = (images: string | null): string[] => {
    if (!images) return [];
    try {
      if (typeof images === 'string') {
        if (images.startsWith('data:image')) return [images];
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(images) ? images : [];
    } catch {
      return [];
    }
  };

  const jsonLd = (() => {
    if (!listing || !listing.isActive || listing.approvalStatus !== 'approved') return null;
    const images = safeParseImages(listing.images);
    const firstImage = images[0] || '/images/logo.svg';
    const url = `https://alo17.tr/ilan/${canonicalSegment}`;
    const imageUrl = firstImage.startsWith('http') ? firstImage : `https://alo17.tr${firstImage}`;

    const conditionUrl = (() => {
      const c = String(listing.condition || '').toLowerCase();
      if (!c) return undefined;
      if (c.includes('new') || c.includes('sifir')) return 'https://schema.org/NewCondition';
      if (c.includes('used') || c.includes('ikinci')) return 'https://schema.org/UsedCondition';
      return undefined;
    })();

    // "Product" schema fits marketplace listings and can enable rich results.
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: (listing.description || '').toString().slice(0, 500),
      image: [imageUrl],
      url,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'TRY',
        price: String(listing.price ?? ''),
        availability: 'https://schema.org/InStock',
        itemCondition: conditionUrl,
        url,
      },
      brand: {
        '@type': 'Brand',
        name: 'Alo17',
      },
    };
  })();

  const breadcrumbJsonLd = (() => {
    if (!listing || !listing.isActive || listing.approvalStatus !== 'approved') return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://alo17.tr/' },
        { '@type': 'ListItem', position: 2, name: 'İlanlar', item: 'https://alo17.tr/ilanlar' },
        {
          '@type': 'ListItem',
          position: 3,
          name: listing.title,
          item: `https://alo17.tr/ilan/${canonicalSegment}`,
        },
      ],
    };
  })();
  
  return (
    <>
      {jsonLd ? <SeoJsonLd id="ld-product" data={jsonLd} /> : null}
      {breadcrumbJsonLd ? <SeoJsonLd id="ld-breadcrumb" data={breadcrumbJsonLd} /> : null}
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <IlanDetayClient id={slugOrId} seo={seo} />
      </Suspense>
    </>
  );
} 