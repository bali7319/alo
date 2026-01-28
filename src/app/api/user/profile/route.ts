import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decryptPhone, encryptPhone } from '@/lib/encryption';
import { sanitizeEmail, sanitizeInput, sanitizePhone } from '@/lib/sanitize';
import { safeError, safeLog } from '@/lib/logger';

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

    // Telefon numarasını çöz (şifrelenmişse)
    const decryptedUser = {
      ...user,
      phone: user.phone ? decryptPhone(user.phone) : null,
    };

    return NextResponse.json({ user: decryptedUser });
  } catch (error) {
    safeError('Profil getirme hatası:', error);
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
    let name = formData.get('name') as string;
    let email = formData.get('email') as string;
    let phone = formData.get('phone') as string;
    let location = formData.get('location') as string;
    const avatar = formData.get('avatar') as File | null;
    
    // Input sanitization
    name = sanitizeInput(name);
    email = sanitizeEmail(email);
    if (phone) {
      // Phone should be digits/+, not HTML-escaped text
      phone = sanitizePhone(phone);
    }
    if (location) {
      location = sanitizeInput(location);
    }

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

    // Profil fotoğrafı işleme
    let imageUrl = user.image;
    if (avatar && avatar.size > 0) {
      try {
        // Dosya boyutu kontrolü (5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (avatar.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: 'Dosya boyutu 5MB\'dan küçük olmalıdır' },
            { status: 400 }
          );
        }

        // Dosya tipi kontrolü
        const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!ALLOWED_TYPES.includes(avatar.type)) {
          return NextResponse.json(
            { error: 'Sadece JPG, PNG, WEBP veya GIF dosyaları yüklenebilir' },
            { status: 400 }
          );
        }

        // Dosyayı okuma
        const bytes = await avatar.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Dosya adı oluştur
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const extension = avatar.name.split('.').pop() || 'jpg';
        const fileName = `${timestamp}-${random}.${extension}`;

        // Upload dizinini oluştur
        const { writeFile, mkdir } = await import('fs/promises');
        const { join } = await import('path');
        const { existsSync } = await import('fs');
        
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        // Dosyayı kaydet
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        // Public URL oluştur
        imageUrl = `/uploads/avatars/${fileName}`;
      } catch (uploadError) {
        safeError('Avatar yükleme hatası:', uploadError);
        // Avatar yüklenemezse mevcut resmi koru
      }
    }

    // Telefon numarası validasyonu + şifrele (varsa)
    let encryptedPhone = null;
    if (phone?.trim()) {
      const normalized = phone.trim();
      // Accept: 10-15 digits, optionally starting with '+'
      if (!/^\+?\d{10,15}$/.test(normalized)) {
        return NextResponse.json(
          { error: 'Telefon numarası geçersiz. Örn: 0541XXXXXXX veya +90541XXXXXXX' },
          { status: 400 }
        );
      }

      const phoneData = encryptPhone(normalized);
      encryptedPhone = phoneData.encrypted; // Sadece encrypted kısmını sakla
    }

    // Kullanıcı bilgilerini güncelle
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: encryptedPhone, // Şifrelenmiş telefon numarası
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

    // Telefon numarasını çöz (response için)
    const decryptedUser = {
      ...updatedUser,
      phone: updatedUser.phone ? decryptPhone(updatedUser.phone) : null,
    };

    return NextResponse.json({ 
      message: 'Profil başarıyla güncellendi',
      user: decryptedUser 
    });
  } catch (error) {
    safeError('Profil güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Profil güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
} 