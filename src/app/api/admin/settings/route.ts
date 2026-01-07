import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdminEmail } from '@/lib/admin';

// Timeout wrapper - 5 saniye içinde cevap vermezse hata döndür
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

// Varsayılan ayarlar
const defaultSettings = {
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

// Veritabanından ayarları getir
async function getSettingsFromDB() {
  try {
    const settingsRecord = await prisma.settings.findUnique({
      where: { key: 'admin_settings' }
    });

    if (settingsRecord) {
      try {
        return JSON.parse(settingsRecord.value);
      } catch (parseError) {
        console.error('JSON parse hatası:', parseError);
        return defaultSettings;
      }
    }

    // Ayarlar yoksa varsayılan değerleri kaydet
    try {
      await prisma.settings.create({
        data: {
          key: 'admin_settings',
          value: JSON.stringify(defaultSettings)
        }
      });
    } catch (createError) {
      console.error('Ayarlar kaydetme hatası (devam ediliyor):', createError);
      // Kaydetme hatası olsa bile varsayılan ayarları döndür
    }

    return defaultSettings;
  } catch (error) {
    console.error('Veritabanından ayar okuma hatası:', error);
    // Herhangi bir hata durumunda varsayılan ayarları döndür
    return defaultSettings;
  }
}

// Ayarları veritabanına kaydet
async function saveSettingsToDB(settings: any) {
  try {
    await prisma.settings.upsert({
      where: { key: 'admin_settings' },
      update: {
        value: JSON.stringify(settings),
        updatedAt: new Date()
      },
      create: {
        key: 'admin_settings',
        value: JSON.stringify(settings)
      }
    });
    return true;
  } catch (error) {
    console.error('Veritabanına ayar kaydetme hatası:', error);
    throw error;
  }
}

export async function GET() {
  try {
    // GET isteği için admin kontrolü yok - herkes ayarları okuyabilir (sadece okuma)
    // PUT isteği için admin kontrolü var (yazma için)
    
    // Timeout koruması ile veritabanından ayarları getir
    let settings;
    try {
      settings = await withTimeout(
        getSettingsFromDB(),
      3000
    );
    } catch (settingsError) {
      console.error('Ayarlar getirme hatası:', settingsError);
      // Veritabanı hatası olsa bile varsayılan ayarları döndür
      settings = defaultSettings;
    }

    return NextResponse.json(settings, {
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
    
    // Herhangi bir hata durumunda varsayılan ayarları döndür
    return NextResponse.json(defaultSettings, {
      status: 200, // 200 döndür ki frontend hata göstermesin
        headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        },
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Admin kontrolü - önce session'dan role'ü kontrol et
    let isAdmin = false;
    
    // Önce session'dan role bilgisini kontrol et (veritabanı bağlantısı gerektirmez)
    const userRole = (session.user as any)?.role;
    if (userRole === 'admin') {
      isAdmin = true;
    } else {
      // Session'da role yoksa veritabanından kontrol et
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true }
        });
        isAdmin = user?.role === 'admin';
      } catch (dbError) {
        console.error('Admin kontrolü sırasında veritabanı hatası:', dbError);
        // Veritabanı hatası durumunda email'e göre kontrol et
        if (session.user.email) {
          isAdmin = isAdminEmail(session.user.email);
        }
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Yetkiniz yok. Sadece admin bu işlemi yapabilir.' },
        { status: 403 }
      );
    }

    // Request body'yi timeout ile parse et
    const body = await withTimeout(
      request.json(),
      5000
    );
    
    // Mevcut ayarları al ve yeni değerlerle birleştir
    const currentSettings = await getSettingsFromDB();
    const updatedSettings = { ...currentSettings, ...body };
    
    // Ayarları veritabanına kaydet
    await withTimeout(
      saveSettingsToDB(updatedSettings),
      5000
    );
    
    return NextResponse.json({ 
      message: 'Ayarlar başarıyla güncellendi',
      settings: updatedSettings
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