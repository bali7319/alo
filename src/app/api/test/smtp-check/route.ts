import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import { createSmtpTransporter, getSmtpSettings } from '@/lib/email';
import { handleApiError } from '@/lib/api-error';

async function handleRequest(request: NextRequest) {
  try {
    // Admin kontrolü
    const session = await getServerSession(authOptions);
    
    const sessionEmail = session?.user?.email || '';
    const isAdmin = Boolean((session?.user as any)?.role === 'admin') || (sessionEmail ? isAdminEmail(sessionEmail) : false);
    if (!session || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // SMTP ayarlarını kontrol et
    const settings = getSmtpSettings();
    const smtpHost = settings?.host;
    const smtpPort = settings?.port ? String(settings.port) : process.env.SMTP_PORT;
    const smtpUser = settings?.user;
    const smtpPass = settings?.pass;
    const smtpFrom = settings?.from;

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
        const smtp = await createSmtpTransporter();
        if (!smtp) {
          throw new Error('SMTP ayarları eksik');
        }
        await smtp.transporter.verify();
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
        flags: {
          ignoreTLS: settings?.ignoreTLS ?? (process.env.SMTP_IGNORE_TLS === 'true'),
          requireTLS: settings?.requireTLS ?? (process.env.SMTP_REQUIRE_TLS === 'true'),
          rejectUnauthorized: settings?.rejectUnauthorized ?? (process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'),
          secure: settings?.secure ?? (process.env.SMTP_SECURE === 'true'),
        }
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
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
