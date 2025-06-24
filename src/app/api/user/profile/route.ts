import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Profil bilgilerini getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    return NextResponse.json(
      { error: 'Profil bilgileri yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Profil bilgilerini güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const location = formData.get('location') as string;
    const avatar = formData.get('avatar') as File | null;

    // Validasyon
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Ad ve e-posta alanları zorunludur' },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // E-posta değişikliği varsa, yeni e-posta adresinin benzersiz olduğunu kontrol et
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }

    // Profil fotoğrafı işleme (basit implementasyon)
    let imageUrl = user.image;
    if (avatar) {
      // Gerçek uygulamada burada dosya yükleme işlemi yapılır
      // Şimdilik basit bir simülasyon
      imageUrl = `/images/avatars/${Date.now()}-${avatar.name}`;
    }

    // Kullanıcı bilgilerini güncelle
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        location: location?.trim() || null,
        image: imageUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ 
      message: 'Profil başarıyla güncellendi',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Profil güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
} 