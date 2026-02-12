import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { decryptPhone } from '@/lib/encryption';

// PayTR API bilgileri
const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || '630576';
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'R6754UcJuF1P1B8h';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'Y2GjjCwCGWdDsYaQ';
const PAYTR_API_URL = 'https://www.paytr.com/odeme/api/get-token';

// PayTR kimlik bilgilerini doğrula
function validatePayTRCredentials() {
  if (!PAYTR_MERCHANT_ID || PAYTR_MERCHANT_ID === '630576') {
    console.warn('PayTR MERCHANT_ID varsayılan değer kullanılıyor. Lütfen .env dosyasında PAYTR_MERCHANT_ID ayarlayın.');
  }
  if (!PAYTR_MERCHANT_KEY || PAYTR_MERCHANT_KEY === 'R6754UcJuF1P1B8h') {
    console.warn('PayTR MERCHANT_KEY varsayılan değer kullanılıyor. Lütfen .env dosyasında PAYTR_MERCHANT_KEY ayarlayın.');
  }
  if (!PAYTR_MERCHANT_SALT || PAYTR_MERCHANT_SALT === 'Y2GjjCwCGWdDsYaQ') {
    console.warn('PayTR MERCHANT_SALT varsayılan değer kullanılıyor. Lütfen .env dosyasında PAYTR_MERCHANT_SALT ayarlayın.');
  }
}

export async function POST(request: NextRequest) {
  try {
    // PayTR kimlik bilgilerini doğrula
    validatePayTRCredentials();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, amount: clientAmount, currency, planType, premiumFeaturesPrice = 0 } = body;

    console.log('=== PayTR INITIALIZE DEBUG ===');
    console.log('Request body:', JSON.stringify(body));
    console.log('listingId:', listingId);
    console.log('planType:', planType);
    console.log('==============================');

    if (!listingId) {
      return NextResponse.json(
        { error: 'İlan ID gerekli' },
        { status: 400 }
      );
    }

    // Tutar: Plan Bazlı Ayarlar'daki fiyatlar kadar alınır (KDV dahil). planType varsa sunucu ayarlarından hesapla
    let amount: number;
    if (planType != null && planType !== '') {
      const settingsRecord = await prisma.settings.findUnique({
        where: { key: 'admin_settings' },
      });
      const settings = settingsRecord ? (() => {
        try { return JSON.parse(settingsRecord.value); } catch { return {}; }
      })() : {};
      const planPrices: Record<string, number> = {
        none: Number(settings.nonePremiumPrice) || 0,
        monthly: Number(settings.monthlyPremiumPrice) ?? 199,
        quarterly: Number(settings.quarterlyPremiumPrice) ?? 494,
        yearly: Number(settings.yearlyPremiumPrice) ?? 2179,
      };
      const planPrice = planPrices[planType] ?? 0;
      amount = planPrice + Number(premiumFeaturesPrice) || 0;
      console.log('PayTR amount (Plan Bazlı Ayarlar):', { planType, planPrice, premiumFeaturesPrice, amount });
    } else {
      amount = parseFloat(clientAmount);
    }

    if (amount == null || isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { error: 'Geçerli tutar gerekli' },
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
    
    // PayTR için user_ip al - PayTR IP kısıtlaması olabilir, bu yüzden gerçek IP'yi almak önemli
    // Nginx veya reverse proxy arkasındaysa x-forwarded-for veya x-real-ip header'larından al
    let user_ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                  request.headers.get('x-real-ip')?.trim() || 
                  null;
    
    // Eğer hala IP bulunamazsa, request'ten IP almayı dene
    if (!user_ip || user_ip === '127.0.0.1' || user_ip === '::1') {
      // Production ortamında mutlaka geçerli bir IP olmalı
      if (process.env.NODE_ENV === 'production') {
        // Sunucunun dış IP'sini al (PayTR panelinde kayıtlı olmalı)
        // Bu IP PayTR panelinde "Sunucu IP Adresi" olarak kayıtlı olmalı
        try {
          // Sunucunun dış IP'sini almak için bir servis kullanabiliriz
          // Ancak bu production'da yavaş olabilir, bu yüzden .env'den almak daha iyi
          const serverIP = process.env.SERVER_IP;
          if (serverIP) {
            user_ip = serverIP;
            console.log('PayTR user_ip (.env\'den alındı):', user_ip);
          } else {
            console.error('PayTR için geçerli bir IP adresi bulunamadı. IP:', user_ip);
            console.error('Lütfen .env dosyasına SERVER_IP ekleyin veya Nginx yapılandırmasını kontrol edin.');
            throw new Error('PayTR için geçerli bir IP adresi gerekli. Lütfen sunucu yapılandırmasını kontrol edin.');
          }
        } catch (error) {
          console.error('PayTR IP alma hatası:', error);
          throw new Error('PayTR için geçerli bir IP adresi gerekli. Lütfen sunucu yapılandırmasını kontrol edin.');
        }
      } else {
        // Development ortamında varsayılan IP kullan
        user_ip = '127.0.0.1';
        console.log('PayTR user_ip (development):', user_ip);
      }
    } else {
      console.log('PayTR user_ip (header\'dan alındı):', user_ip);
    }
    
    // IPv6 kontrolü - PayTR sadece IPv4 destekliyor
    if (user_ip && user_ip.includes(':')) {
      console.warn('PayTR IPv6 desteklemiyor. IPv4 adresi gerekli. IP:', user_ip);
      // IPv6 adresini IPv4'e çevirmeye çalışma, hata ver
      throw new Error('PayTR sadece IPv4 adreslerini destekler. Lütfen IPv4 adresi kullanın.');
    }
    // PayTR için tutarı kuruş cinsine çevir (10.50 TL -> 1050 kuruş)
    const payment_amount = Math.round(parseFloat(amount) * 100);
    
    // Payment amount kontrolü - kuruş cinsinden olmalı
    if (payment_amount <= 0 || isNaN(payment_amount)) {
      throw new Error('Geçersiz ödeme tutarı');
    }
    
    console.log('=== PayTR PAYMENT AMOUNT DEBUG ===');
    console.log('PayTR amount (raw from request):', amount, typeof amount);
    console.log('PayTR amount (parsed float):', parseFloat(amount));
    console.log('PayTR payment_amount (kuruş):', payment_amount);
    console.log('PayTR payment_amount (TL):', (payment_amount / 100).toFixed(2));
    console.log('===================================');
    
    // PayTR user_basket formatı: Base64 encoded JSON array
    // Format: [["Ürün Adı", "Fiyat", "Adet"], ...]
    // ÖNEMLİ: user_basket içindeki tutar payment_amount ile uyuşmalı!
    const basketAmount = (payment_amount / 100).toFixed(2); // Kuruşu TL'ye çevir (1050 -> 10.50)
    const basketArray = [
      [listing.title.substring(0, 200), basketAmount, 1] // Başlık max 200 karakter, tutar payment_amount ile uyumlu
    ];
    const user_basket = Buffer.from(JSON.stringify(basketArray)).toString('base64');
    console.log('=== PayTR USER_BASKET DEBUG ===');
    console.log('PayTR payment_amount (kuruş):', payment_amount);
    console.log('PayTR basketAmount (TL):', basketAmount);
    console.log('PayTR user_basket:', user_basket);
    console.log('PayTR user_basket decoded:', JSON.stringify(basketArray));
    console.log('================================');
    
    // PayTR parametreleri
    const no_installment = 0; // Taksit yok (0 = taksit yok, 1 = taksit var)
    const max_installment = 0; // Maksimum taksit sayısı
    const currency_code = 'TL';
    // PayTR test_mode: 0 = canlı, 1 = test
    // Production'da her zaman 0 olmalı
    // NOT: PayTR panelinde canlı mod aktifse test_mode=0 olmalı
    // .env'de PAYTR_TEST_MODE=0 yaparak canlı moda geçebilirsiniz
    const test_mode = process.env.PAYTR_TEST_MODE === '1' ? 1 : 0; // .env'de PAYTR_TEST_MODE=0 yapın
    console.log('PayTR test_mode (0=canlı, 1=test):', test_mode);
    console.log('PayTR .env PAYTR_TEST_MODE:', process.env.PAYTR_TEST_MODE);
    
    // PayTR hash oluşturma - DOĞRU SIRALAMA (PayTR resmi dokümantasyonuna göre):
    // merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode + merchant_salt
    // ÖNEMLİ: Bu sıralama değişmemelidir! Tüm değerler string olarak birleştirilmeli, boşluk veya özel karakter olmamalı
    const hash_str = `${PAYTR_MERCHANT_ID}${user_ip}${merchant_oid}${user.email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency_code}${test_mode}${PAYTR_MERCHANT_SALT}`;
    
    console.log('=== PayTR HASH OLUŞTURMA (DOĞRU FORMAT) ===');
    console.log('PayTR merchant_id:', PAYTR_MERCHANT_ID);
    console.log('PayTR user_ip:', user_ip);
    console.log('PayTR merchant_oid:', merchant_oid);
    console.log('PayTR email:', user.email);
    console.log('PayTR payment_amount (kuruş):', payment_amount);
    console.log('PayTR user_basket:', user_basket);
    console.log('PayTR no_installment:', no_installment);
    console.log('PayTR max_installment:', max_installment);
    console.log('PayTR currency:', currency_code);
    console.log('PayTR test_mode:', test_mode);
    console.log('PayTR merchant_salt:', PAYTR_MERCHANT_SALT);
    console.log('PayTR hash string (ilk 100 karakter):', hash_str.substring(0, 100));
    console.log('PayTR hash string length:', hash_str.length);
    console.log('===========================================');
    
    // Hash hesaplama
    const paytr_token = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hash_str).digest('base64');
    console.log('PayTR token oluşturuldu:', paytr_token.substring(0, 20) + '...');
    
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
      user_phone: user.phone ? decryptPhone(user.phone) : '05000000000',
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
          'User-Agent': 'Mozilla/5.0 (compatible; Alo17/1.0)',
        },
        body: paytrFormData.toString(),
      });

      // PayTR yanıtını al (401 durumunda bile yanıtı oku)
      let paytrResult = '';
      try {
        paytrResult = await paytrResponse.text();
        console.log('=== PayTR API YANITI ===');
        console.log('Status:', paytrResponse.status, paytrResponse.statusText);
        console.log('Response Body:', paytrResult);
        console.log('Response Body Length:', paytrResult.length);
        console.log('Response Headers:', JSON.stringify(Object.fromEntries(paytrResponse.headers.entries())));
        console.log('========================');
      } catch (error: any) {
        console.error('PayTR yanıt okuma hatası:', error);
        paytrResult = 'Yanıt okunamadı: ' + error.message;
      }
      
      if (!paytrResponse.ok) {
        console.error('=== PayTR API HTTP HATASI ===');
        console.error('Status:', paytrResponse.status, paytrResponse.statusText);
        console.error('Response Body:', paytrResult);
        console.error('Response Body Length:', paytrResult.length);
        console.error('Response Headers:', JSON.stringify(Object.fromEntries(paytrResponse.headers.entries())));
        
        // 401 hatası için daha detaylı bilgi
        if (paytrResponse.status === 401) {
          // PayTR yanıtını parse et
          let errorReason = 'Kimlik doğrulama hatası';
          if (paytrResult) {
            // PayTR genellikle "status=error&reason=..." formatında döner
            const errorMatch = paytrResult.match(/status=error&reason=([^&]+)/);
            if (errorMatch) {
              errorReason = decodeURIComponent(errorMatch[1]);
            } else if (paytrResult.includes('status=error')) {
              errorReason = paytrResult;
            } else {
              errorReason = paytrResult;
            }
          }
          
          // Detaylı debug bilgileri
          console.error('=== PayTR 401 HATA DETAYLARI ===');
          console.error('PayTR Hata Mesajı:', errorReason);
          console.error('Merchant ID:', PAYTR_MERCHANT_ID);
          console.error('Merchant Key (ilk 10 karakter):', PAYTR_MERCHANT_KEY.substring(0, 10) + '...');
          console.error('Merchant Salt:', PAYTR_MERCHANT_SALT);
          console.error('User IP:', user_ip);
          console.error('Merchant OID:', merchant_oid);
          console.error('Email:', user.email);
          console.error('Payment Amount:', payment_amount);
          console.error('User Basket:', user_basket);
          console.error('Test Mode:', test_mode);
          console.error('Hash String:', hash_str);
          console.error('Hash String Uzunluğu:', hash_str.length);
          console.error('PayTR Token:', paytr_token);
          console.error('================================');
          
          // Kullanıcıya daha anlaşılır hata mesajı
          return NextResponse.json(
            { 
              error: `PayTR kimlik doğrulama hatası (401): ${errorReason}`,
              details: process.env.NODE_ENV === 'development' ? {
                merchant_id: PAYTR_MERCHANT_ID,
                user_ip: user_ip,
                test_mode: test_mode,
                hash_length: hash_str.length,
                paytr_response: paytrResult
              } : undefined
            },
            { status: 401 }
          );
        }
        
        throw new Error(`PayTR API HTTP hatası: ${paytrResponse.status} ${paytrResponse.statusText}. Yanıt: ${paytrResult}`);
      }
      
      // PayTR yanıtını parse et - hem JSON hem de query string formatını destekle
      let paytrToken: string | null = null;
      let paytrStatus: string | null = null;
      
      // JSON formatını kontrol et
      if (paytrResult.trim().startsWith('{')) {
        try {
          const jsonResponse = JSON.parse(paytrResult);
          paytrStatus = jsonResponse.status;
          paytrToken = jsonResponse.token;
          console.log('PayTR JSON yanıtı parse edildi:', { status: paytrStatus, token: paytrToken ? paytrToken.substring(0, 20) + '...' : null });
        } catch (jsonError) {
          console.error('PayTR JSON parse hatası:', jsonError);
        }
      }
      
      // Query string formatını kontrol et (JSON parse başarısız olduysa veya query string formatındaysa)
      if (!paytrToken && paytrResult.includes('status=')) {
        if (paytrResult.startsWith('status=success')) {
          paytrStatus = 'success';
          const tokenMatch = paytrResult.match(/token=([^&]+)/);
          paytrToken = tokenMatch ? tokenMatch[1] : null;
        } else if (paytrResult.includes('status=error')) {
          paytrStatus = 'error';
        }
      }
      
      // Başarılı yanıt kontrolü
      if (paytrStatus === 'success' && paytrToken) {
        console.log('PayTR token başarıyla alındı:', paytrToken.substring(0, 20) + '...');

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
          merchant_ok_url: `${process.env.NEXTAUTH_URL || 'https://alo17.tr'}/odeme/basarili?merchant_oid=${merchant_oid}`,
          merchant_fail_url: `${process.env.NEXTAUTH_URL || 'https://alo17.tr'}/odeme/basarisiz?merchant_oid=${merchant_oid}`,
          timeout_limit: 30,
          currency: currency_code,
          test_mode: test_mode,
        }, { status: 200 });
      } else {
        // Hata mesajını parse et
        let errorReason = 'Bilinmeyen hata';
        
        // JSON formatında hata
        if (paytrResult.trim().startsWith('{')) {
          try {
            const jsonResponse = JSON.parse(paytrResult);
            if (jsonResponse.reason) {
              errorReason = jsonResponse.reason;
            } else if (jsonResponse.message) {
              errorReason = jsonResponse.message;
            } else {
              errorReason = JSON.stringify(jsonResponse);
            }
          } catch (jsonError) {
            // JSON parse başarısız, query string formatını dene
            const errorMatch = paytrResult.match(/status=error&reason=([^&]+)/);
            errorReason = errorMatch ? decodeURIComponent(errorMatch[1]) : paytrResult;
          }
        } else {
          // Query string formatında hata
          const errorMatch = paytrResult.match(/status=error&reason=([^&]+)/);
          errorReason = errorMatch ? decodeURIComponent(errorMatch[1]) : paytrResult || 'Bilinmeyen hata';
        }
        
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

