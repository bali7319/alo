import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Dosya boyutu ${MAX_FILE_SIZE / (1024 * 1024)}MB'dan küçük olmalıdır` },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece JPG, PNG, WEBP veya GIF dosyaları yüklenebilir' },
        { status: 400 }
      );
    }

    // Dosyayı okuma
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dosya adı oluştur (timestamp + random + extension)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}-${random}.${extension}`;

    // Upload dizinini oluştur
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Dosyayı kaydet
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Public URL oluştur
    const fileUrl = `/uploads/avatars/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
    });
  } catch (error: any) {
    console.error('Avatar yükleme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

