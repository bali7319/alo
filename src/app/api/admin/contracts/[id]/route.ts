import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Tek sözleşme getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // TODO: Contract tablosu oluşturulduktan sonra aktif edilecek
    // Geçici olarak type assertion kullanıyoruz
    const contract = await (prisma as any).contract?.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Sözleşme bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(contract);
  } catch (error: any) {
    console.error('Sözleşme getirme hatası:', error);
    return NextResponse.json(
      { error: 'Sözleşme yüklenemedi', details: error.message },
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

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      type,
      content,
      version,
      isActive,
      isRequired,
      language,
      expiresAt,
    } = body;

    // Validasyon
    if (!title || !type || !content || !version || !language) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanlar doldurulmalı' },
        { status: 400 }
      );
    }

    const existingContract = await (prisma as any).contract.findUnique({
      where: { id },
    });

    if (!existingContract) {
      return NextResponse.json({ error: 'Sözleşme bulunamadı' }, { status: 404 });
    }

    // Eğer aktif hale getiriliyorsa ve daha önce yayınlanmamışsa, yayınlanma tarihini ekle
    const publishedAt = isActive && !existingContract.publishedAt
      ? new Date()
      : existingContract.publishedAt;

    const contract = await (prisma as any).contract.update({
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
  } catch (error: any) {
    console.error('Sözleşme güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Sözleşme güncellenemedi', details: error.message },
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

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    const existingContract = await (prisma as any).contract.findUnique({
      where: { id },
    });

    if (!existingContract) {
      return NextResponse.json({ error: 'Sözleşme bulunamadı' }, { status: 404 });
    }

    const publishedAt = isActive && !existingContract.publishedAt
      ? new Date()
      : existingContract.publishedAt;

    const contract = await (prisma as any).contract.update({
      where: { id },
      data: {
        isActive,
        publishedAt,
      },
    });

    return NextResponse.json(contract);
  } catch (error: any) {
    console.error('Sözleşme durum güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Sözleşme durumu güncellenemedi', details: error.message },
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

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const contract = await (prisma as any).contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Sözleşme bulunamadı' }, { status: 404 });
    }

    await (prisma as any).contract.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Sözleşme silindi' });
  } catch (error: any) {
    console.error('Sözleşme silme hatası:', error);
    return NextResponse.json(
      { error: 'Sözleşme silinemedi', details: error.message },
      { status: 500 }
    );
  }
}
