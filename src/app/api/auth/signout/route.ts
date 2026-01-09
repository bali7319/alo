import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Session'ı temizle
    const response = NextResponse.json({ success: true });
    
    // Tüm olası cookie'leri temizle (httpOnly cookie'ler için)
    const cookieNames = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      '__Host-next-auth.session-token',
      'authjs.session-token',
      'authjs.csrf-token',
    ];
    
    // Production'da secure cookie'ler kullanılıyor
    const isProduction = process.env.NODE_ENV === 'production';
    
    cookieNames.forEach(name => {
      // Cookie'yi sil
      response.cookies.delete(name);
      
      // Farklı path'ler için cookie'yi temizle
      ['/', '/admin', '/api'].forEach(path => {
        // Normal cookie
        response.cookies.set(name, '', {
          expires: new Date(0),
          path: path,
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
        });
        
        // Domain ile cookie (alo17.tr için)
        response.cookies.set(name, '', {
          expires: new Date(0),
          path: path,
          domain: '.alo17.tr',
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
        });
        
        // Domain olmadan cookie (alo17.tr için)
        response.cookies.set(name, '', {
          expires: new Date(0),
          path: path,
          domain: 'alo17.tr',
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
        });
      });
    });
    
    return response;
  } catch (error) {
    console.error('Signout hatası:', error);
    return NextResponse.json(
      { error: 'Signout sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
