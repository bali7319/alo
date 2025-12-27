import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// İlanın favori durumunu kontrol et
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ isFavorite: false });
    }

    const { id: listingId } = await params;

    if (!listingId) {
      return NextResponse.json(
        { error: 'İlan ID\'si gerekli' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ isFavorite: false });
    }

    // Favori durumunu kontrol et
    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listingId,
        },
      },
    });

    return NextResponse.json({ 
      isFavorite: !!favorite 
    });
  } catch (error) {
    console.error('Favori durumu kontrol hatası:', error);
    return NextResponse.json({ isFavorite: false });
  }
} 