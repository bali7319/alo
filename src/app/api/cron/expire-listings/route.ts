import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cron job için güvenlik: Sadece belirli secret key ile çalışsın
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key-here';

export async function GET(request: NextRequest) {
  try {
    // Güvenlik kontrolü - Vercel cron jobs otomatik olarak Authorization header ekler
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.nextUrl.searchParams.get('secret');
    const vercelCron = request.headers.get('x-vercel-cron'); // Vercel cron job header'ı
    
    // Vercel cron job'dan geliyorsa veya doğru secret key varsa izin ver
    if (vercelCron || authHeader === `Bearer ${CRON_SECRET}` || cronSecret === CRON_SECRET) {
      // Devam et
    } else {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    
    // Süresi dolan ilanları bul (expiresAt < now ve isActive = true)
    const expiredListings = await prisma.listing.findMany({
      where: {
        isActive: true,
        expiresAt: {
          lt: now
        }
      },
      select: {
        id: true,
        expiresAt: true
      }
    });

    // İlanları pasif yap
    const result = await prisma.listing.updateMany({
      where: {
        id: {
          in: expiredListings.map(l => l.id)
        }
      },
      data: {
        isActive: false
      }
    });

    // 7 günden eski expired ilanları sil (opsiyonel - istenirse kaldırılabilir)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Not: İlanları silmek yerine sadece pasif yapıyoruz, böylece profil sayfasında görünebilirler

    return NextResponse.json({
      success: true,
      expiredCount: result.count,
      message: `${result.count} ilan yayından kaldırıldı`,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Cron job hatası:', error);
    return NextResponse.json(
      { 
        error: 'Cron job çalıştırılırken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

// POST method da destekle (bazı cron servisleri POST kullanır)
export async function POST(request: NextRequest) {
  return GET(request);
}

