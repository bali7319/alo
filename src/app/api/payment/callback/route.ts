import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

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

    // merchant_oid'den listingId'yi çıkar (format: alo17_listingId_timestamp)
    const parts = merchant_oid.split('_');
    const listingId = parts.length >= 2 ? parts[1] : null;

    if (status === 'success') {
      // Ödeme başarılı
      if (listingId) {
        // İlanı premium yap
        await prisma.listing.update({
          where: { id: listingId },
          data: {
            isPremium: true,
            premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
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

      return NextResponse.json({ status: 'success' }, { status: 200 });
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
  } finally {
    await prisma.$disconnect();
  }
}

