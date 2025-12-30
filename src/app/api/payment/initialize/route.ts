import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// PayTR API bilgileri
const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || '630576';
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'R6754UcJuF1P1B8h';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'Y2GjjCwCGWdDsYaQ';
const PAYTR_API_URL = 'https://www.paytr.com/odeme/api/get-token';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, amount, currency } = body;

    if (!listingId || !amount) {
      return NextResponse.json(
        { error: 'İlan ID ve tutar gerekli' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // İlanı kontrol et
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // İlanın kullanıcıya ait olduğunu kontrol et
    if (listing.userId !== user.id) {
      return NextResponse.json(
        { error: 'Bu ilan size ait değil' },
        { status: 403 }
      );
    }

    // PayTR için gerekli verileri hazırla
    // merchant_oid sadece alfanumerik karakterler içermeli ve en fazla 64 karakter olmalı
    // listingId'yi hash'leyip kısaltıyoruz (16 karakter hash + 8 karakter timestamp = 24 karakter)
    const listingIdHash = crypto.createHash('md5').update(listingId).digest('hex').substring(0, 16); // İlk 16 karakter
    const timestamp = Date.now().toString().slice(-8); // Son 8 karakter (yaklaşık 3 yıl yeterli)
    const merchant_oid = `alo17${listingIdHash}${timestamp}`; // Toplam: 5 + 16 + 8 = 29 karakter (64'ten küçük)
    const user_ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const payment_amount = Math.round(parseFloat(amount) * 100); // Kuruş cinsinden
    // PayTR user_basket formatı: Base64 encoded JSON array
    // Format: [["Ürün Adı", "Fiyat", "Adet"], ...]
    const basketArray = [
      [listing.title.substring(0, 200), parseFloat(amount).toFixed(2), 1] // Başlık max 200 karakter
    ];
    const user_basket = Buffer.from(JSON.stringify(basketArray)).toString('base64');
    console.log('PayTR user_basket:', user_basket);
    console.log('PayTR user_basket decoded:', JSON.stringify(basketArray));
    
    const no_installment = 0;
    const max_installment = 0;
    const currency_code = 'TL';
    const test_mode = process.env.NODE_ENV === 'development' ? 1 : 0;
    
    // PayTR hash oluşturma
    // PayTR hash formatı: merchant_id + merchant_salt + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
    const hash_str = `${PAYTR_MERCHANT_ID}${PAYTR_MERCHANT_SALT}${merchant_oid}${user.email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency_code}${test_mode}`;
    console.log('PayTR hash string:', hash_str);
    console.log('PayTR hash string length:', hash_str.length);
    const paytr_token = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hash_str).digest('base64');
    console.log('PayTR token:', paytr_token);
    
    // PayTR API'ye token isteği gönder
    const paytrFormData = new URLSearchParams({
      merchant_id: PAYTR_MERCHANT_ID,
      user_ip: user_ip,
      merchant_oid: merchant_oid,
      email: user.email,
      payment_amount: payment_amount.toString(),
      paytr_token: paytr_token,
      user_basket: user_basket,
      debug_on: process.env.NODE_ENV === 'development' ? '1' : '0',
      no_installment: no_installment.toString(),
      max_installment: max_installment.toString(),
      user_name: user.name || user.email.split('@')[0],
      user_address: user.location || 'Adres belirtilmemiş',
      user_phone: user.phone || '05000000000',
      merchant_ok_url: `${process.env.NEXTAUTH_URL || 'https://alo17.tr'}/odeme/basarili?merchant_oid=${merchant_oid}`,
      merchant_fail_url: `${process.env.NEXTAUTH_URL || 'https://alo17.tr'}/odeme/basarisiz?merchant_oid=${merchant_oid}`,
      timeout_limit: '30',
      currency: currency_code,
      test_mode: test_mode.toString(),
    });

    // PayTR API'ye istek gönder
    try {
      console.log('PayTR API isteği gönderiliyor:', PAYTR_API_URL);
      console.log('PayTR merchant_id:', PAYTR_MERCHANT_ID);
      console.log('PayTR merchant_oid:', merchant_oid);
      console.log('PayTR payment_amount:', payment_amount);
      console.log('PayTR paytr_token:', paytr_token);
      console.log('PayTR form data:', paytrFormData.toString());
      
      const paytrResponse = await fetch(PAYTR_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: paytrFormData.toString(),
      });

      if (!paytrResponse.ok) {
        console.error('PayTR API HTTP hatası:', paytrResponse.status, paytrResponse.statusText);
        throw new Error(`PayTR API HTTP hatası: ${paytrResponse.status} ${paytrResponse.statusText}`);
      }

      const paytrResult = await paytrResponse.text();
      console.log('PayTR API yanıtı:', paytrResult);
      
      // PayTR yanıtını parse et
      if (paytrResult.startsWith('status=success')) {
        // Token başarıyla alındı
        const tokenMatch = paytrResult.match(/token=([^&]+)/);
        const paytrToken = tokenMatch ? tokenMatch[1] : null;
        
        if (!paytrToken) {
          console.error('PayTR token bulunamadı. Yanıt:', paytrResult);
          throw new Error('PayTR token alınamadı');
        }

        console.log('PayTR token başarıyla alındı');

        // Form verilerini döndür
        return NextResponse.json({
          merchant_id: PAYTR_MERCHANT_ID,
          user_ip: user_ip,
          merchant_oid: merchant_oid,
          email: user.email,
          payment_amount: payment_amount,
          paytr_token: paytrToken,
          user_basket: user_basket,
          debug_on: test_mode,
          no_installment: no_installment,
          max_installment: max_installment,
          user_name: user.name || user.email.split('@')[0],
          user_address: user.location || 'Adres belirtilmemiş',
          user_phone: user.phone || '05000000000',
          merchant_ok_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payment/callback?merchant_oid=${merchant_oid}`,
          merchant_fail_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payment/failed?merchant_oid=${merchant_oid}`,
          timeout_limit: 30,
          currency: currency_code,
          test_mode: test_mode,
        }, { status: 200 });
      } else {
        // Hata mesajını parse et
        const errorMatch = paytrResult.match(/status=error&reason=([^&]+)/);
        const errorReason = errorMatch ? decodeURIComponent(errorMatch[1]) : paytrResult || 'Bilinmeyen hata';
        console.error('PayTR API hatası:', errorReason);
        throw new Error(`PayTR hatası: ${errorReason}`);
      }
    } catch (paytrError: any) {
      console.error('PayTR API hatası:', paytrError);
      console.error('PayTR API hata detayı:', paytrError?.message, paytrError?.stack);
      throw new Error(paytrError.message || 'PayTR bağlantı hatası');
    }
  } catch (error: any) {
    console.error('Ödeme başlatma hatası:', error);
    console.error('Hata detayı:', error?.message, error?.stack);
    return NextResponse.json(
      { 
        error: error?.message || 'Ödeme başlatılırken bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

