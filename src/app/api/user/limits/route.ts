import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Admin ayarlarını paylaşılan modülden al
// Not: Bu basit bir çözüm, gerçek uygulamada veritabanı kullanılmalı
let adminSettingsCache: {
  noneMaxListings: number;
  monthlyMaxListings: number;
  quarterlyMaxListings: number;
  yearlyMaxListings: number;
  noneMaxTotalImages: number;
  monthlyMaxTotalImages: number;
  quarterlyMaxTotalImages: number;
  yearlyMaxTotalImages: number;
} | null = null;

async function getAdminSettings() {
  if (adminSettingsCache) {
    return adminSettingsCache;
  }
  
  // Admin settings API'sinden ayarları al
  try {
    // Base URL'i doğru şekilde belirle
    let baseUrl = 'http://localhost:3000';
    if (process.env.NEXTAUTH_URL) {
      baseUrl = process.env.NEXTAUTH_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    }
    
    const response = await fetch(`${baseUrl}/api/admin/settings`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (response.ok) {
      const settings = await response.json();
      adminSettingsCache = {
        noneMaxListings: settings.noneMaxListings || 0,
        monthlyMaxListings: settings.monthlyMaxListings || 0,
        quarterlyMaxListings: settings.quarterlyMaxListings || 0,
        yearlyMaxListings: settings.yearlyMaxListings || 20,
        noneMaxTotalImages: settings.noneMaxTotalImages || 0,
        monthlyMaxTotalImages: settings.monthlyMaxTotalImages || 0,
        quarterlyMaxTotalImages: settings.quarterlyMaxTotalImages || 0,
        yearlyMaxTotalImages: settings.yearlyMaxTotalImages || 200
      };
      return adminSettingsCache;
    }
  } catch (error) {
    console.error('Admin ayarları yüklenemedi:', error);
  }
  
  // Varsayılan değerler
  return {
    noneMaxListings: 0,
    monthlyMaxListings: 0,
    quarterlyMaxListings: 0,
    yearlyMaxListings: 20,
    noneMaxTotalImages: 0,
    monthlyMaxTotalImages: 0,
    quarterlyMaxTotalImages: 0,
    yearlyMaxTotalImages: 200
  };
}

// Kullanıcının ilan ve resim limitlerini kontrol et
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Aktif ilanları getir (süresi dolmamış ve aktif olanlar)
    const activeListings = await prisma.listing.findMany({
      where: {
        userId: user.id,
        isActive: true,
        expiresAt: {
          gt: new Date()
        },
        approvalStatus: 'approved'
      },
      select: {
        id: true
      }
    });

    // Aktif ilan sayısı
    const activeListingCount = activeListings.length;

    // Kullanıcının aktif aboneliğini kontrol et
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        endDate: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Admin ayarlarından limitleri al
    const adminSettings = await getAdminSettings();

    // Kullanıcının planına göre limitleri belirle
    let maxListings = 0;

    if (activeSubscription) {
      switch (activeSubscription.planType) {
        case 'monthly':
          maxListings = adminSettings.monthlyMaxListings;
          break;
        case 'quarterly':
          maxListings = adminSettings.quarterlyMaxListings;
          break;
        case 'yearly':
          maxListings = adminSettings.yearlyMaxListings;
          break;
        default:
          maxListings = adminSettings.noneMaxListings;
      }
    } else {
      // Abonelik yoksa ücretsiz plan limitleri
      maxListings = adminSettings.noneMaxListings;
    }

    return NextResponse.json({
      activeListingCount,
      planType: activeSubscription?.planType || 'none',
      limits: {
        maxListings
      }
    });
  } catch (error) {
    console.error('Limit kontrolü hatası:', error);
    return NextResponse.json(
      { error: 'Limit kontrolü yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}
