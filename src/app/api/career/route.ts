import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createCareerApplicationSchema } from '@/lib/validations/career';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Zod validation
    const validationResult = createCareerApplicationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validasyon hatası',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const {
      fullName,
      email,
      phone,
      position,
      experience,
      education,
      coverLetter,
      resume,
    } = validationResult.data;

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
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
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
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

