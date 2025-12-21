import { Suspense } from 'react';
import IlanDetayClient from './IlanDetayClient';
import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ id: string }>;
}

// SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    });

    if (!listing || !listing.isActive || listing.approvalStatus !== 'approved') {
      return {
        title: 'İlan Bulunamadı',
        description: 'Aradığınız ilan bulunamadı veya yayından kaldırılmış olabilir.',
      };
    }

    const images = JSON.parse(listing.images || '[]');
    const firstImage = images[0] || '/images/placeholder.jpg';
    const price = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(listing.price);

    const title = `${listing.title} - ${price} | Alo17`;
    const description = `${listing.description.substring(0, 160)}... ${listing.location} - Çanakkale`;

    return {
      title,
      description,
      keywords: [
        listing.title.toLowerCase(),
        listing.category.toLowerCase(),
        listing.location.toLowerCase(),
        'çanakkale',
        'ikinci el',
        'satılık',
        'alo17',
      ],
      openGraph: {
        title,
        description,
        url: `https://alo17.tr/ilan/${id}`,
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
        canonical: `https://alo17.tr/ilan/${id}`,
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
  const { id } = await params;
  
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <IlanDetayClient id={id} />
    </Suspense>
  );
} 