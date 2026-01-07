import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// PayTR API bilgileri
const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || '630576';
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'R6754UcJuF1P1B8h';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'Y2GjjCwCGWdDsYaQ';
const PAYTR_REFUND_API_URL = 'https://www.paytr.com/odeme/iade';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Admin veya yetkili kullanıcı kontrolü
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Admin kontrolü - sadece adminler iade yapabilir
    // TODO: İsterseniz bu kontrolü kaldırabilir veya farklı bir yetkilendirme yapabilirsiniz
    // if (user.role !== 'ADMIN') {
    //   return NextResponse.json(
    //     { error: 'Bu işlem için yetkiniz yok' },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const { merchant_oid, return_amount, reference_no } = body;

    // Validasyon
    if (!merchant_oid) {
      return NextResponse.json(
        { error: 'Merchant OID gerekli' },
        { status: 400 }
      );
    }

    if (!return_amount || isNaN(parseFloat(return_amount)) || parseFloat(return_amount) <= 0) {
      return NextResponse.json(
        { error: 'Geçerli bir iade tutarı gerekli' },
        { status: 400 }
      );
    }

    // İade tutarını string olarak formatla (örn: "11.97")
    const returnAmountStr = parseFloat(return_amount).toFixed(2);

    // PayTR iade hash hesaplama
    // Format: merchant_id + merchant_oid + return_amount + merchant_salt
    const hash_str = `${PAYTR_MERCHANT_ID}${merchant_oid}${returnAmountStr}${PAYTR_MERCHANT_SALT}`;
    console.log('PayTR iade hash string:', hash_str);
    
    const paytr_token = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY)
      .update(hash_str)
      .digest('base64');

    console.log('PayTR iade token oluşturuldu');

    // PayTR API'ye iade isteği gönder
    const postData = new URLSearchParams({
      merchant_id: PAYTR_MERCHANT_ID,
      merchant_oid: merchant_oid,
      return_amount: returnAmountStr,
      paytr_token: paytr_token,
    });

    // reference_no varsa ekle (opsiyonel)
    if (reference_no) {
      postData.append('reference_no', reference_no);
    }

    console.log('PayTR iade API isteği gönderiliyor:', PAYTR_REFUND_API_URL);
    console.log('PayTR iade merchant_oid:', merchant_oid);
    console.log('PayTR iade return_amount:', returnAmountStr);

    const paytrResponse = await fetch(PAYTR_REFUND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (compatible; Alo17/1.0)',
      },
      body: postData.toString(),
    });

    // PayTR yanıtını al
    const paytrResult = await paytrResponse.text();
    console.log('PayTR iade API yanıtı:', paytrResult);
    console.log('PayTR iade API yanıt durumu:', paytrResponse.status, paytrResponse.statusText);

    if (!paytrResponse.ok) {
      console.error('PayTR iade API HTTP hatası:', paytrResponse.status, paytrResponse.statusText);
      console.error('PayTR iade API yanıt içeriği:', paytrResult);
      
      // 401 hatası için daha detaylı bilgi
      if (paytrResponse.status === 401) {
        throw new Error(`PayTR kimlik doğrulama hatası (401). Lütfen merchant_id, merchant_key ve merchant_salt değerlerini kontrol edin.`);
      }
      
      throw new Error(`PayTR iade API HTTP hatası: ${paytrResponse.status} ${paytrResponse.statusText}. Yanıt: ${paytrResult}`);
    }

    // PayTR yanıtını parse et (JSON formatında döner)
    let result;
    try {
      result = JSON.parse(paytrResult);
    } catch (parseError) {
      console.error('PayTR iade yanıt parse hatası:', parseError);
      throw new Error(`PayTR iade yanıtı parse edilemedi: ${paytrResult}`);
    }

    if (result.status === 'success') {
      console.log('PayTR iade başarılı:', result);

      // Veritabanında iade kaydı oluştur (isteğe bağlı)
      // TODO: İsterseniz burada bir Payment veya Refund tablosuna kayıt ekleyebilirsiniz
      
      return NextResponse.json({
        success: true,
        status: result.status,
        is_test: result.is_test,
        merchant_oid: result.merchant_oid,
        return_amount: result.return_amount,
        message: 'İade işlemi başarıyla tamamlandı',
      }, { status: 200 });
    } else {
      // Hata durumu
      const errorNo = result.err_no || 'Bilinmeyen';
      const errorMsg = result.err_msg || 'İade işlemi başarısız';
      console.error('PayTR iade hatası:', errorNo, errorMsg);
      
      return NextResponse.json({
        success: false,
        error: {
          code: errorNo,
          message: errorMsg,
        },
        details: result,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('PayTR iade hatası:', error);
    console.error('Hata detayı:', error?.message, error?.stack);
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || 'İade işlemi sırasında bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

