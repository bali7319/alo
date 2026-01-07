import { Suspense } from 'react';
import IlanDetayClient from './IlanDetayClient';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { createSlug, extractIdFromSlug } from '@/lib/slug';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Timeout wrapper - 8 saniye içinde cevap vermezse hata döndür
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

// SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: slugOrId } = await params;
  
  try {
    // Slug'dan ID çıkarmayı dene, yoksa slug olarak kabul et
    const possibleId = extractIdFromSlug(slugOrId);
    
    let listing;
    if (possibleId) {
      // Eski ID formatı - direkt ID ile ara
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
        5000 // 5 saniye timeout
      );
    } else {
      // Slug formatı - Daha esnek arama: En az bir kelime eşleşsin, sonra slug ile tam eşleşen ilanı bul
      const keywords = slugOrId
        .split('-')
        .filter(word => word.length > 1) // 1 karakterden uzun kelimeleri al (daha esnek)
        .slice(0, 10); // İlk 10 kelimeyi al (uzun başlıklar için)
      
      // En az 1 kelime varsa, title'da bu kelimelerden en az birini içeren ilanları bul (OR condition - daha esnek)
      if (keywords.length >= 1) {
        // En önemli kelimeleri al (ilk 3 kelime genelde en önemli)
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
            take: 200, // Daha fazla aday kontrol et
          }),
          3000 // 3 saniye timeout
        );
        
        listing = candidates.find(l => {
          const listingSlug = createSlug(l.title);
          return listingSlug === slugOrId;
        });
      }
      
      // Eğer hala bulunamadıysa, son 500 ilanı çek ve slug ile eşleştir (fallback)
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
            take: 500, // Daha fazla ilan kontrol et
          }),
          3000 // 3 saniye timeout
        );
        
        listing = recentListings.find(l => {
          const listingSlug = createSlug(l.title);
          return listingSlug === slugOrId;
        });
      }
      
      // Eğer listing bulunduysa, tam detaylarını çek
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

    if (!listing || !listing.isActive || listing.approvalStatus !== 'approved') {
      return {
        title: 'İlan Bulunamadı',
        description: 'Aradığınız ilan bulunamadı veya yayından kaldırılmış olabilir.',
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

    const listingSlug = createSlug(listing.title);
    
    // SEO optimized title - İlan başlığı otomatik kullanılıyor
    const title = `${listing.title} - ${price} | ${listing.category} | Alo17 Çanakkale`;
    
    // SEO optimized description - İlan açıklaması ve başlığı kullanılıyor
    const descriptionText = listing.description 
      ? listing.description.substring(0, 150).trim()
      : `${listing.title} - ${listing.category} kategorisinde satılık ilan`;
    const description = `${descriptionText}... ${listing.location}, Çanakkale. Fiyat: ${price}. Alo17'de güvenli alışveriş.`;
    
    // SEO-friendly URL - İlan başlığından slug oluştur (sadece slug)
    const canonicalUrl = `https://alo17.tr/ilan/${listingSlug}`;

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
    };
  }
}

export default async function IlanDetayPage({ params }: PageProps) {
  const { id: slugOrId } = await params;
  
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <IlanDetayClient id={slugOrId} />
    </Suspense>
  );
} 