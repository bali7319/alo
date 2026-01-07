import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { registerSchema } from '@/lib/validations/user';
import { encryptPhone } from '@/lib/encryption';
import { sanitizeEmail, sanitizeInput } from '@/lib/sanitize';
import { safeLog, safeError } from '@/lib/logger';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting kontrolü
    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(`register:${ip}`, 5, 60000); // 5 istek/dakika
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          message: 'Çok fazla kayıt denemesi. Lütfen daha sonra tekrar deneyin.',
          error: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Zod validation
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Validasyon hatası',
          error: 'VALIDATION_ERROR',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    let { name, email, phone, password } = validationResult.data;
    
    // Input sanitization
    name = sanitizeInput(name);
    email = sanitizeEmail(email);
    if (phone) {
      phone = sanitizeInput(phone);
    }
    
    if (!email) {
      return NextResponse.json(
        { 
          message: 'Geçersiz email adresi',
          error: 'INVALID_EMAIL'
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

    // Telefon numarasını şifrele (varsa)
    let encryptedPhone = null;
    if (phone) {
      const phoneData = encryptPhone(phone);
      encryptedPhone = phoneData.encrypted;
    }

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: encryptedPhone, // Şifrelenmiş telefon numarası
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
    safeError('Kayıt hatası:', error);
    
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

