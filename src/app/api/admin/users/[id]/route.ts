import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';
import { Prisma } from '@prisma/client';

// Kullanıcı rolünü güncelle (moderator atama/kaldırma)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    const { id } = await params;
    const body = await request.json();
    const { role, phone, name, isActive } = body; // "user", "moderator", "admin", phone, name, isActive

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // admin@alo17.tr kullanıcısı korumalı - rolü değiştirilemez
    if (user.email === 'admin@alo17.tr' && role !== undefined && role !== user.role) {
      return NextResponse.json(
        { error: 'Bu kullanıcı sistem kullanıcısıdır ve korumalıdır. Rolü değiştirilemez.' },
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Güncellenecek verileri hazırla
    const updateData: Prisma.UserUpdateInput = {};
    
    // İsim güncelleme
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json(
          { error: 'Geçersiz isim formatı' },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const trimmed = name.trim();
      if (trimmed.length > 100) {
        return NextResponse.json(
          { error: 'İsim en fazla 100 karakter olabilir' },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      updateData.name = trimmed === '' ? null : trimmed;
    }

    // Telefon numarası güncelleme
    if (phone !== undefined) {
      const { encryptPhone } = await import('@/lib/encryption');
      if (phone && phone.trim() !== '') {
        const phoneData = encryptPhone(phone.trim());
        updateData.phone = phoneData.encrypted;
      } else {
        updateData.phone = null;
      }
    }

    // Aktiflik durumu güncelleme
    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'Geçersiz aktiflik formatı' },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      updateData.isActive = isActive;
    }
    
    if (role !== undefined) {
      // Geçerli roller
      const validRoles = ['user', 'moderator', 'admin'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Geçersiz rol. Geçerli roller: user, moderator, admin' },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Eğer bir admin kullanıcısının rolü admin'den başka bir şeye değiştiriliyorsa,
      // sistemde en az bir admin kalmalı kontrolü yap
      if (user.role === 'admin' && role !== 'admin') {
        // Toplam admin sayısını kontrol et
        const adminCount = await prisma.user.count({
          where: { role: 'admin' }
        });
        
        // Eğer sadece bir admin varsa ve bu admin'in rolü değiştirilmeye çalışılıyorsa
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: 'Sistemde en az bir admin kullanıcı bulunmalıdır. Bu kullanıcının rolü değiştirilemez.' },
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      
      updateData.role = role;
    }

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            sentMessages: true,
            receivedMessages: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Kullanıcı rolü başarıyla güncellendi',
      user: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
      },
    }, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return handleApiError(error);
  }
}

// Kullanıcıyı sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    const adminUser = await prisma.user.findUnique({
      where: { email: session!.user!.email! },
      select: { id: true },
    });

    const { id } = await params;

    if (adminUser && id === adminUser.id) {
      return NextResponse.json(
        { error: 'Kendinizi silemezsiniz' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // admin@alo17.tr kullanıcısı korumalı - silinemez
    if (user.email === 'admin@alo17.tr') {
      return NextResponse.json(
        { error: 'Bu kullanıcı sistem kullanıcısıdır ve korumalıdır. Silinemez.' },
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Kullanıcıyı sil (cascade delete ile ilgili kayıtlar da silinecek)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Kullanıcı başarıyla silindi',
    }, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return handleApiError(error);
  }
}

