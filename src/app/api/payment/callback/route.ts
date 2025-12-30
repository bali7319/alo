import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// PayTR API bilgileri
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'R6754UcJuF1P1B8h';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'Y2GjjCwCGWdDsYaQ';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const merchant_oid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const total_amount = formData.get('total_amount') as string;
    const hash = formData.get('hash') as string;
    const failed_reason_code = formData.get('failed_reason_code') as string;
    const failed_reason_msg = formData.get('failed_reason_msg') as string;
    const test_mode = formData.get('test_mode') as string;
    const payment_type = formData.get('payment_type') as string;
    const currency = formData.get('currency') as string;
    const payment_amount = formData.get('payment_amount') as string;

    if (!merchant_oid) {
      return NextResponse.json(
        { error: 'Merchant OID gerekli' },
        { status: 400 }
      );
    }

    // PayTR hash doğrulama
    const hash_str = `${PAYTR_MERCHANT_SALT}${merchant_oid}${status}${total_amount}`;
    const calculated_hash = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hash_str).digest('base64');

    if (calculated_hash !== hash) {
      console.error('PayTR hash doğrulama hatası:', { calculated_hash, received_hash: hash });
      return NextResponse.json(
        { error: 'Hash doğrulama hatası' },
        { status: 400 }
      );
    }

    // merchant_oid'den listingId'yi bul (format: alo17{listingIdHash}{timestamp})
    // Hash'ten listingId'yi geri çıkaramayız, bu yüzden veritabanında hash ile eşleştirme yapıyoruz
    let listingId: string | null = null;
    
    if (merchant_oid.startsWith('alo17') && merchant_oid.length >= 29) {
      const withoutPrefix = merchant_oid.substring(5); // 'alo17' prefix'ini kaldır
      const listingIdHash = withoutPrefix.substring(0, 16); // İlk 16 karakter hash
      
      // Hash ile eşleşen listingId'yi bul
      // Not: Bu yaklaşım hash collision riski taşır, production'da PaymentTransaction modeli kullanılmalı
      try {
        // Son 100 ilanı kontrol et (performans için optimize edilebilir)
        const listings = await prisma.listing.findMany({
          select: { id: true },
          orderBy: { createdAt: 'desc' },
          take: 100, // Son 100 ilanı kontrol et
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

    if (status === 'success') {
      // Ödeme başarılı
      if (listingId) {
        // İlanı premium yap
        await prisma.listing.update({
          where: { id: listingId },
          data: {
            isPremium: true,
            premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
            approvalStatus: 'pending', // Ödeme sonrası onaya gönderildi
          },
        });
      }

      // Ödeme kaydını logla
      console.log('Ödeme başarılı:', {
        merchant_oid,
        listingId,
        total_amount,
        payment_type,
        currency,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ 
        status: 'success',
        listingId,
        merchant_oid 
      }, { status: 200 });
    } else {
      // Ödeme başarısız
      console.log('Ödeme başarısız:', {
        merchant_oid,
        listingId,
        failed_reason_code,
        failed_reason_msg,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ status: 'failed' }, { status: 200 });
    }
  } catch (error) {
    console.error('PayTR callback hatası:', error);
    return NextResponse.json(
      { error: 'Callback işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

