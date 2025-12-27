import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // Validasyon
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          message: 'Ad, email ve şifre zorunludur',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          message: 'Geçerli bir email adresi giriniz',
          error: 'INVALID_EMAIL'
        },
        { status: 400 }
      );
    }

    // Şifre uzunluk kontrolü
    if (password.length < 6) {
      return NextResponse.json(
        { 
          message: 'Şifre en az 6 karakter olmalıdır',
          error: 'WEAK_PASSWORD'
        },
        { status: 400 }
      );
    }

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          message: 'Bu email adresi ile zaten bir hesap mevcut',
          error: 'USER_EXISTS'
        },
        { status: 409 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await hash(password, 12);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        location: null,
      },
    });

    // Şifreyi response'dan çıkar
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'Kayıt başarılı',
        user: userWithoutPassword,
      },
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Kayıt hatası:', error);
    
    // Error object'i güvenli şekilde serialize et
    const errorMessage = error instanceof Error ? error.message : 'Kayıt işlemi sırasında bir hata oluştu';
    const errorName = error instanceof Error ? error.name : 'Error';
    
    return NextResponse.json(
      {
        message: errorMessage,
        error: errorName,
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

