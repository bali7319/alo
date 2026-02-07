import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';

// API route'unu dynamic yap - cache yapma
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export async function GET(request: NextRequest) {
  // GET isteği için admin kontrolü yok - herkes ayarları okuyabilir (sadece okuma)
  // PUT isteği için admin kontrolü var (yazma için)
  
  // Log'ları her zaman yaz - sorun tespiti için
  console.log('[API GET] /api/admin/settings isteği alındı');
  console.log('[API GET] Request URL:', request.url);
  console.log('[API GET] Request method:', request.method);
  console.log('[API GET] Headers:', JSON.stringify(Object.fromEntries(request.headers.entries())));
  console.log('[API GET] Timestamp:', new Date().toISOString());
  
  try {
    
    // Timeout koruması ile veritabanından ayarları getir
    let settings;
    try {
      settings = await withTimeout(
        getSettingsFromDB(),
      3000
    );
      console.log('API: Veritabanından gelen ayarlar:', {
        noneMaxImages: settings.noneMaxImages,
        noneMaxImagesType: typeof settings.noneMaxImages,
        monthlyMaxImages: settings.monthlyMaxImages,
        quarterlyMaxImages: settings.quarterlyMaxImages
      });
    } catch (settingsError) {
      console.error('Ayarlar getirme hatası:', settingsError);
      // Veritabanı hatası olsa bile varsayılan ayarları döndür
      settings = defaultSettings;
      console.log('API: Varsayılan ayarlar kullanılıyor:', {
        noneMaxImages: settings.noneMaxImages
      });
    }

    console.log('API: Döndürülen ayarlar (noneMaxImages):', settings.noneMaxImages);
    
    // Response'u her zaman fresh olarak işaretle - cache yapma
    return NextResponse.json(settings, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'X-Timestamp': new Date().toISOString(), // Debug için timestamp ekle
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
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    // Request body'yi timeout ile parse et
    const body = await withTimeout(
      request.json(),
      5000
    );
    
    // Mevcut ayarları al ve yeni değerlerle birleştir
    const currentSettings = await getSettingsFromDB();
    const updatedSettings = { ...currentSettings, ...body };
    
    console.log('API PUT: Kaydedilecek ayarlar:', {
      noneMaxImages: updatedSettings.noneMaxImages,
      monthlyMaxImages: updatedSettings.monthlyMaxImages,
      quarterlyMaxImages: updatedSettings.quarterlyMaxImages,
      yearlyMaxImagesPerListing: updatedSettings.yearlyMaxImagesPerListing
    });
    
    // Ayarları veritabanına kaydet
    await withTimeout(
      saveSettingsToDB(updatedSettings),
      5000
    );
    
    console.log('API PUT: Ayarlar başarıyla kaydedildi');
    
    // Kaydedilen ayarları tekrar oku ve doğrula
    const savedSettings = await getSettingsFromDB();
    console.log('API PUT: Kaydedilen ayarlar doğrulandı:', {
      noneMaxImages: savedSettings.noneMaxImages
    });
    
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
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.' },
        { status: 504 }
      );
    }
    return handleApiError(error);
  }
} 