import { NextRequest, NextResponse } from 'next/server';

// Timeout wrapper - 5 saniye içinde cevap vermezse hata döndür
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

// Basit bir in-memory storage (gerçek uygulamada veritabanı kullanılmalı)
let settings = {
  premiumPrice: 50,
  premiumDuration: 30,
  regularDuration: 7,
  featuredPrice: 25,
  featuredDuration: 15,
  urgentPrice: 15,
  urgentDuration: 7,
  highlightPrice: 10,
  highlightDuration: 5,
  topPrice: 35,
  topDuration: 20,
  maxImages: 5,
  premiumMaxImages: 10,
  autoRenewalDiscount: 10,
  monthlyPremiumPrice: 199,
  quarterlyPremiumPrice: 494,
  yearlyPremiumPrice: 2179,
  nonePremiumPrice: 0,
  extendedDurationPrice: 25,
  morePhotosPrice: 19,
  // Yıllık premium limitleri
  yearlyMaxListings: 20,
  yearlyMaxTotalImages: 200,
  // Plan bazlı resim limitleri
  noneMaxImages: 3,
  monthlyMaxImages: 5,
  quarterlyMaxImages: 10,
  yearlyMaxImagesPerListing: 10,
  // Plan bazlı ilan limitleri
  noneMaxListings: 0,
  monthlyMaxListings: 0,
  quarterlyMaxListings: 0,
  // Plan bazlı toplam resim limitleri
  noneMaxTotalImages: 0,
  monthlyMaxTotalImages: 0,
  quarterlyMaxTotalImages: 0
};

export async function GET() {
  try {
    // Timeout koruması ile response döndür
    const response = await withTimeout(
      Promise.resolve(settings),
      3000
    );

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    
    // Timeout hatası
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('Request timeout:', error.message);
      return NextResponse.json(
        { error: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.', settings: {} },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ayarlar yüklenirken hata oluştu', settings: {} },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Request body'yi timeout ile parse et
    const body = await withTimeout(
      request.json(),
      5000
    );
    
    // Settings'i güncelle
    settings = { ...settings, ...body };
    
    return NextResponse.json({ 
      message: 'Ayarlar başarıyla güncellendi',
      settings 
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    
    // Timeout hatası
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('Request timeout:', error.message);
      return NextResponse.json(
        { error: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ayarlar güncellenirken hata oluştu' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
} 