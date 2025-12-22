import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'İlan ID gerekli' },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Premium özellikleri parse et
    let premiumFeatures = null;
    if (listing.premiumFeatures) {
      try {
        premiumFeatures = JSON.parse(listing.premiumFeatures);
      } catch (e) {
        // JSON parse hatası
      }
    }

    const formattedListing = {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      category: listing.category,
      subCategory: listing.subCategory,
      subSubCategory: listing.subSubCategory,
      phone: listing.phone,
      showPhone: listing.showPhone,
      images: JSON.parse(listing.images),
      features: JSON.parse(listing.features),
      condition: listing.condition,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      isPremium: listing.isPremium,
      premiumFeatures,
      premiumUntil: listing.premiumUntil?.toISOString(),
      expiresAt: listing.expiresAt.toISOString(),
      views: listing.views,
      isActive: listing.isActive,
      approvalStatus: listing.approvalStatus,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      user: listing.user,
    };

    return NextResponse.json({ listing: formattedListing });
  } catch (error) {
    console.error('İlan getirme hatası:', error);
    return NextResponse.json(
      { error: 'İlan yüklenirken hata oluştu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

