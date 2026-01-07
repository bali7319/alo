import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { updateContractSchema } from '@/lib/validations/contract';

// GET - Tek sözleşme getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    const userRole = session?.user?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const contract = await prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Sözleşme bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(contract);
  } catch (error: unknown) {
    console.error('Sözleşme getirme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: 'Sözleşme yüklenemedi', details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Sözleşme güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    const userRole = session?.user?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Zod validation (partial - sadece gönderilen alanlar validate edilir)
    const validationResult = updateContractSchema.partial().safeParse({ ...body, id });
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
      title,
      type,
      content,
      version,
      isActive,
      isRequired,
      language,
      expiresAt,
    } = validationResult.data;

    const existingContract = await prisma.contract.findUnique({
      where: { id },
    });

    if (!existingContract) {
      return NextResponse.json({ error: 'Sözleşme bulunamadı' }, { status: 404 });
    }

    // Eğer aktif hale getiriliyorsa ve daha önce yayınlanmamışsa, yayınlanma tarihini ekle
    const publishedAt = isActive && !existingContract.publishedAt
      ? new Date()
      : existingContract.publishedAt;

    const contract = await prisma.contract.update({
      where: { id },
      data: {
        title,
        type,
        content,
        version,
        isActive,
        isRequired,
        language,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        publishedAt,
      },
    });

    return NextResponse.json(contract);
  } catch (error: unknown) {
    console.error('Sözleşme güncelleme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: 'Sözleşme güncellenemedi', details: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH - Sözleşme durumunu güncelle (aktif/pasif)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    const userRole = session?.user?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    const existingContract = await prisma.contract.findUnique({
      where: { id },
    });

    if (!existingContract) {
      return NextResponse.json({ error: 'Sözleşme bulunamadı' }, { status: 404 });
    }

    const publishedAt = isActive && !existingContract.publishedAt
      ? new Date()
      : existingContract.publishedAt;

    const contract = await prisma.contract.update({
      where: { id },
      data: {
        isActive,
        publishedAt,
      },
    });

    return NextResponse.json(contract);
  } catch (error: unknown) {
    console.error('Sözleşme durum güncelleme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: 'Sözleşme durumu güncellenemedi', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Sözleşme sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    const userRole = session?.user?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const contract = await prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Sözleşme bulunamadı' }, { status: 404 });
    }

    await prisma.contract.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Sözleşme silindi' });
  } catch (error: unknown) {
    console.error('Sözleşme silme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: 'Sözleşme silinemedi', details: errorMessage },
      { status: 500 }
    );
  }
}
