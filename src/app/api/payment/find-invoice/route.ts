import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const merchant_oid = searchParams.get('merchant_oid');

    if (!merchant_oid) {
      return NextResponse.json(
        { error: 'merchant_oid gerekli' },
        { status: 400 }
      );
    }

    // merchant_oid'den listingId'yi bul (format: alo17{listingIdHash}{timestamp})
    let listingId: string | null = null;
    
    if (merchant_oid.startsWith('alo17') && merchant_oid.length >= 29) {
      const withoutPrefix = merchant_oid.substring(5); // 'alo17' prefix'ini kaldır
      const listingIdHash = withoutPrefix.substring(0, 16); // İlk 16 karakter hash
      
      try {
        // Son 100 ilanı kontrol et (performans için optimize edilebilir)
        const listings = await prisma.listing.findMany({
          select: { id: true },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        
        for (const listing of listings) {
          const hash = crypto.createHash('md5').update(listing.id).digest('hex').substring(0, 16);
          if (hash === listingIdHash) {
            listingId = listing.id;
            break;
          }
        }
      } catch (error) {
        console.error('listingId bulma hatası:', error);
        listingId = null;
      }
    }

    if (!listingId) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // İlan ile ilişkili faturayı bul
    const invoice = await prisma.invoice.findFirst({
      where: {
        listingId: listingId,
        status: 'paid',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Fatura bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      listingId: listingId,
    });
  } catch (error) {
    console.error('Fatura arama hatası:', error);
    return NextResponse.json(
      { error: 'Fatura aranırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

