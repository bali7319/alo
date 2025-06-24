import { NextRequest, NextResponse } from 'next/server';

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
  extendedDurationPrice: 25,
  morePhotosPrice: 19
};

export async function GET() {
  try {
    return NextResponse.json(settings, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json(
      { error: 'Ayarlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    settings = { ...settings, ...body };
    
    return NextResponse.json({ 
      message: 'Ayarlar başarıyla güncellendi',
      settings 
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    return NextResponse.json(
      { error: 'Ayarlar güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
} 