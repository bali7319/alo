import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Durum belirtilmelidir' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Geçersiz durum' },
        { status: 400 }
      );
    }

    const application = await prisma.careerApplication.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Başvuru durumu başarıyla güncellendi',
        application,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Başvuru güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Başvuru güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const application = await prisma.careerApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Başvuru bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application }, { status: 200 });
  } catch (error) {
    console.error('Başvuru getirme hatası:', error);
    return NextResponse.json(
      { error: 'Başvuru yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

