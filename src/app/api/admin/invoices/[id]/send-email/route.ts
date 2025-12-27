import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Fatura bulunamadı' },
        { status: 404 }
      );
    }

    // Email gönderme (şimdilik simüle ediyoruz)
    // TODO: Gerçek email servisi entegrasyonu (Nodemailer, SendGrid, vb.)

    // Email gönderildi olarak işaretle
    await prisma.invoice.update({
      where: { id },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Fatura e-postası başarıyla gönderildi',
    });
  } catch (error: any) {
    console.error('E-posta gönderme hatası:', error);
    return NextResponse.json(
      { error: 'E-posta gönderilemedi', details: error.message },
      { status: 500 }
    );
  }
}

