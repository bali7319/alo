import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';
import { Prisma } from '@prisma/client';
import { decryptPhone } from '@/lib/encryption';

// Admin için kullanıcıları getir (sayfalama ile)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search'); // Arama terimi
    const role = searchParams.get('role'); // Rol filtresi (moderator,admin veya moderator,admin)

    const skip = (page - 1) * limit;

    // Filtre oluştur
    const where: Prisma.UserWhereInput = {};
    if (search) {
      // SQLite için case-insensitive arama (mode: 'insensitive' desteklenmiyor)
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    
    // Rol filtresi (arma için)
    if (role) {
      const roles = role.split(',').map(r => r.trim());
      where.role = { in: roles };
    }

    // Toplam kayıt sayısı ve kullanıcıları paralel getir (performans için)
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          location: true,
          role: true,
          createdAt: true,
          // Fallback için: son ilanın telefonunu çek
          listings: {
            select: {
              phone: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              listings: true,
              sentMessages: true,
              receivedMessages: true,
            },
          },
        },
      }),
    ]);

    // Date object'lerini ISO string'e çevir, role field'ını güvenli hale getir ve telefon numaralarını çöz
    const formattedUsers = await Promise.all(users.map(async (user) => {
      let decryptedPhone: string | null = user.phone || null;
      const lastListingPhoneRaw = user.listings?.[0]?.phone || null;
      
      // Telefon numarasını çöz (şifrelenmişse)
      if (decryptedPhone && decryptedPhone.trim() !== '') {
        try {
          // Şifrelenmiş telefon numaraları ":" içerir (format: IV:Tag:Encrypted)
          if (decryptedPhone.includes(':') && decryptedPhone.split(':').length === 3) {
            try {
              // decryptPhone artık null döndürebilir (hata durumunda)
              const decrypted = decryptPhone(decryptedPhone);
              
              if (decrypted && decrypted.length > 0) {
                // Şifre çözme başarılı, temizle ve kontrol et
                const cleaned = decrypted.trim();
                
                // Geçerli telefon: sadece rakam, +, boşluk, tire, parantez içerir ve uzunluğu makul (5-25 karakter)
                // Türkiye telefon numaraları: 0XXX XXX XX XX veya +90 XXX XXX XX XX formatında olabilir
                const isValidPhone = cleaned.length >= 5 && 
                                     cleaned.length <= 25 &&
                                     /^[\d\s\+\-\(\)]+$/.test(cleaned);
                
                if (isValidPhone) {
                  decryptedPhone = cleaned;
                  console.log(`✓ Telefon çözüldü (user: ${user.id}): ${cleaned.substring(0, 5)}...`);
                } else {
                  // Geçersiz format ama yine de göster (debug için)
                  console.warn(`⚠ Telefon geçersiz format (user: ${user.id}): ${cleaned.substring(0, 15)}...`);
                  decryptedPhone = cleaned; // Yine de göster, admin kontrol edebilsin
                }
              } else {
                // Şifre çözme başarısız (null döndü)
                // ENCRYPTION_KEY kontrolü yap
                const hasEncryptionKey = !!process.env.ENCRYPTION_KEY;
                console.error(`✗ Telefon çözülemedi (user: ${user.id}): Şifre çözme başarısız. ENCRYPTION_KEY: ${hasEncryptionKey ? 'VAR' : 'YOK'}`);
                decryptedPhone = null;
              }
            } catch (error) {
              // Genel hata
              console.error(`✗ Telefon işleme hatası (user: ${user.id}):`, error);
              decryptedPhone = null;
            }
          } else {
            // ":" içermiyorsa zaten düz metin, olduğu gibi kullan
            console.log(`ℹ Telefon düz metin (user: ${user.id}): ${decryptedPhone.substring(0, 10)}...`);
            // Ama boş string ise null yap
            if (decryptedPhone.trim() === '') {
              decryptedPhone = null;
            }
          }
        } catch (error) {
          // Genel hata
          console.error(`✗ Telefon işleme hatası (user: ${user.id}):`, error);
          decryptedPhone = null;
        }
      } else {
        // Boş veya null ise null yap
        decryptedPhone = null;
      }
      
      return {
        ...user,
        phone: decryptedPhone,
        // UI'da ayrı gösterilsin diye fallback alanı
        fallbackPhone: (!decryptedPhone && lastListingPhoneRaw && lastListingPhoneRaw.trim() !== '') ? lastListingPhoneRaw : null,
        role: user.role || 'user', // Varsayılan olarak 'user' kullan
        createdAt: user.createdAt.toISOString(),
      };
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

