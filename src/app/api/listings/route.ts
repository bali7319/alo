import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      category,
      subCategory,
      subSubCategory,
      location,
      phone,
      showPhone,
      images,
      features,
      condition,
      brand,
      model,
      year,
      isPremium,
      premiumFeatures,
      premiumUntil,
      expiresAt,
    } = body;

    // Validasyon
    if (!title || !description || !price || !category || !location) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun' },
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

    // İlanı oluştur - approvalStatus: 'pending' olarak ayarla
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        subCategory: subCategory || null,
        subSubCategory: subSubCategory || null,
        location,
        phone: phone || null,
        showPhone: showPhone !== false,
        images: JSON.stringify(images || []),
        features: JSON.stringify(features || []),
        condition: condition || null,
        brand: brand || null,
        model: model || null,
        year: year || null,
        isPremium: isPremium || false,
        premiumFeatures: premiumFeatures ? JSON.stringify(premiumFeatures) : null,
        premiumUntil: premiumUntil ? new Date(premiumUntil) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
        views: 0,
        isActive: true,
        approvalStatus: 'pending', // Moderatör/Admin onayına düşer
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: 'İlanınız başarıyla oluşturuldu. Moderatör onayından sonra yayınlanacaktır.',
        listing,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('İlan oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'İlan oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

