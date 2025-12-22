import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      position,
      experience,
      education,
      coverLetter,
      resume,
    } = body;

    // Validasyon
    if (!fullName || !email || !phone || !position || !coverLetter) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun' },
        { status: 400 }
      );
    }

    // Email validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz' },
        { status: 400 }
      );
    }

    // Kariyer başvurusu oluştur
    const application = await prisma.careerApplication.create({
      data: {
        fullName,
        email,
        phone,
        position,
        experience: experience || null,
        education: education || null,
        coverLetter,
        resume: resume || null,
        status: 'pending',
      },
    });

    return NextResponse.json(
      {
        message: 'Başvurunuz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Kariyer başvurusu hatası:', error);
    return NextResponse.json(
      { error: 'Başvuru gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    // Admin kontrolü için session kontrolü yapılabilir
    // Şimdilik tüm başvuruları döndürüyoruz
    const applications = await prisma.careerApplication.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error('Kariyer başvuruları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Başvurular yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

