import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Session'ı temizle
    const response = NextResponse.json({ success: true });
    
    // Tüm olası cookie'leri temizle
    const cookieNames = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      'authjs.session-token',
      'authjs.csrf-token',
    ];
    
    cookieNames.forEach(name => {
      response.cookies.delete(name);
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      
      // Domain ile de dene
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/',
        domain: '.alo17.tr',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
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
