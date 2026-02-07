import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

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
  } catch (error) {
    return handleApiError(error);
  }
}

