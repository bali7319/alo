import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Moderator için ilan onaylama/reddetme
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Admin veya moderator kontrolü
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json(
        { error: 'Yetkiniz yok. Sadece admin ve moderatörler bu işlemi yapabilir.' },
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, notes } = body; // action: 'approve' | 'reject', notes: string (optional)

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    let updateData: Prisma.ListingUpdateInput = {
      moderator: {
        connect: { id: user.id },
      },
      moderatedAt: new Date(),
      moderatorNotes: notes || null,
    };

    switch (action) {
      case 'approve':
        updateData.approvalStatus = 'approved';
        updateData.isActive = true;
        break;
      
      case 'reject':
        updateData.approvalStatus = 'rejected';
        updateData.isActive = false;
        break;
      
      default:
        return NextResponse.json(
          { error: 'Geçersiz işlem' },
          { status: 400 }
        );
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Date object'lerini ISO string'e çevir
    const formattedListing = {
      ...updatedListing,
      moderatedAt: updatedListing.moderatedAt ? updatedListing.moderatedAt.toISOString() : null,
      createdAt: updatedListing.createdAt.toISOString(),
      updatedAt: updatedListing.updatedAt.toISOString(),
      expiresAt: updatedListing.expiresAt.toISOString(),
      premiumUntil: updatedListing.premiumUntil ? updatedListing.premiumUntil.toISOString() : null,
    };

    return NextResponse.json({
      message: 'İşlem başarılı',
      listing: formattedListing,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Moderator ilan işlem hatası:', error);
    
    // Error object'i güvenli şekilde serialize et
    const errorMessage = error instanceof Error ? error.message : 'İşlem sırasında bir hata oluştu';
    const errorName = error instanceof Error ? error.name : 'Error';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        type: errorName
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

// Moderator için ilan düzenleme
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Admin veya moderator kontrolü
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json(
        { error: 'Yetkiniz yok. Sadece admin ve moderatörler bu işlemi yapabilir.' },
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // İlan bilgilerini güncelle
    const updateData: Prisma.ListingUpdateInput = {
      moderator: {
        connect: { id: user.id },
      },
      moderatedAt: new Date(),
    };

    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.location) updateData.location = body.location;
    if (body.category) updateData.category = body.category;
    if (body.subCategory !== undefined) updateData.subCategory = body.subCategory;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.showPhone !== undefined) updateData.showPhone = body.showPhone;
    if (body.images) updateData.images = JSON.stringify(body.images);
    if (body.features) updateData.features = JSON.stringify(body.features);
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.moderatorNotes) updateData.moderatorNotes = body.moderatorNotes;

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Date object'lerini ISO string'e çevir
    const formattedListing = {
      ...updatedListing,
      moderatedAt: updatedListing.moderatedAt ? updatedListing.moderatedAt.toISOString() : null,
      createdAt: updatedListing.createdAt.toISOString(),
      updatedAt: updatedListing.updatedAt.toISOString(),
      expiresAt: updatedListing.expiresAt.toISOString(),
      premiumUntil: updatedListing.premiumUntil ? updatedListing.premiumUntil.toISOString() : null,
    };

    return NextResponse.json({
      message: 'İlan başarıyla güncellendi',
      listing: formattedListing,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Moderator ilan düzenleme hatası:', error);
    
    // Error object'i güvenli şekilde serialize et
    const errorMessage = error instanceof Error ? error.message : 'İlan güncellenirken bir hata oluştu';
    const errorName = error instanceof Error ? error.name : 'Error';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        type: errorName
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

