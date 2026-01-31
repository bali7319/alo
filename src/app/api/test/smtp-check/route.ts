import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function handleRequest(request: NextRequest) {
  try {
    // Admin kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // SMTP ayarlarını kontrol et
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM;

    // Ayarların durumunu kontrol et
    const hasHost = !!smtpHost;
    const hasPort = !!smtpPort;
    const hasUser = !!smtpUser;
    const hasPass = !!smtpPass;
    const hasFrom = !!smtpFrom;

    const allConfigured = hasHost && hasUser && hasPass;
    const partiallyConfigured = hasHost || hasUser || hasPass;

    // Bağlantı testleri
    let connectionTest = null;
    if (allConfigured) {
      try {
        const nodemailer = await import('nodemailer');
        const port = parseInt(smtpPort || '587');
        const isSecure = port === 465;

        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: port,
          secure: isSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
            minVersion: 'TLSv1',
            secureProtocol: 'TLSv1_2_method',
          },
          requireTLS: false,
          connectionTimeout: 5000,
          greetingTimeout: 5000,
        });

        await transporter.verify();
        connectionTest = {
          success: true,
          message: 'SMTP bağlantısı başarılı',
        };
      } catch (error: any) {
        connectionTest = {
          success: false,
          message: error.message || 'SMTP bağlantı hatası',
          code: (error as any).code,
        };
      }
    }

    return NextResponse.json({
      configured: allConfigured,
      partiallyConfigured,
      settings: {
        host: {
          configured: hasHost,
          value: hasHost ? smtpHost : null,
          masked: hasHost ? `${smtpHost?.substring(0, 3)}***` : null,
        },
        port: {
          configured: hasPort,
          value: hasPort ? smtpPort : null,
          default: '587',
        },
        user: {
          configured: hasUser,
          value: hasUser ? smtpUser : null,
          masked: hasUser ? `${smtpUser?.substring(0, 3)}***@***` : null,
        },
        pass: {
          configured: hasPass,
          masked: hasPass ? '***' : null,
        },
        from: {
          configured: hasFrom,
          value: hasFrom ? smtpFrom : smtpUser || 'noreply@alo17.tr',
        },
      },
      connectionTest,
      status: allConfigured
        ? (connectionTest?.success ? 'ready' : 'error')
        : partiallyConfigured
        ? 'incomplete'
        : 'not_configured',
      message: allConfigured
        ? (connectionTest?.success
          ? 'SMTP ayarları yapılandırılmış ve bağlantı başarılı'
          : 'SMTP ayarları yapılandırılmış ancak bağlantı hatası var')
        : partiallyConfigured
        ? 'SMTP ayarları eksik - bazı ayarlar yapılandırılmamış'
        : 'SMTP ayarları yapılandırılmamış - email simülasyon modunda çalışıyor',
    });
  } catch (error: any) {
    console.error('SMTP kontrol hatası:', error);
    return NextResponse.json(
      { 
        error: error.message || 'SMTP ayarları kontrol edilirken bir hata oluştu',
        status: 'error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
