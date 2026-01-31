import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function pickEmailProvider() {
  const forced = (process.env.EMAIL_TRANSPORT || '').toLowerCase().trim();
  if (forced === 'resend' || forced === 'smtp' || forced === 'simulation') return forced;
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
  return 'simulation';
}

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

    // HTTPS mail API (Resend) ayarları
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || process.env.RESEND_FROM || smtpFrom || smtpUser || null;

    // Ayarların durumunu kontrol et
    const hasHost = !!smtpHost;
    const hasPort = !!smtpPort;
    const hasUser = !!smtpUser;
    const hasPass = !!smtpPass;
    const hasFrom = !!smtpFrom;

    const smtpConfigured = hasHost && hasUser && hasPass;
    const smtpPartiallyConfigured = hasHost || hasUser || hasPass;
    const resendConfigured = !!resendApiKey && !!emailFrom;

    const provider = pickEmailProvider();

    // Bağlantı testleri
    let connectionTest = null;
    if (provider === 'resend' && resendConfigured) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 7000);
        const res = await fetch('https://api.resend.com/domains', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          signal: ctrl.signal,
        }).finally(() => clearTimeout(t));

        const body = await res.text();
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${body}`);

        connectionTest = {
          success: true,
          message: 'Resend API bağlantısı başarılı',
        };
      } catch (error: any) {
        connectionTest = {
          success: false,
          message: error.message || 'Resend API bağlantı hatası',
          code: (error as any).code,
        };
      }
    } else if (provider === 'smtp' && smtpConfigured) {
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
      provider,
      configured: provider === 'resend' ? resendConfigured : smtpConfigured,
      partiallyConfigured: provider === 'resend' ? !!resendApiKey : smtpPartiallyConfigured,
      settings: {
        resend: {
          configured: resendConfigured,
          hasApiKey: !!resendApiKey,
          from: emailFrom,
        },
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
      status:
        provider === 'resend'
          ? resendConfigured
            ? connectionTest?.success
              ? 'ready'
              : 'error'
            : resendApiKey
              ? 'incomplete'
              : 'not_configured'
          : smtpConfigured
            ? connectionTest?.success
              ? 'ready'
              : 'error'
            : smtpPartiallyConfigured
              ? 'incomplete'
              : 'not_configured',
      message:
        provider === 'resend'
          ? resendConfigured
            ? connectionTest?.success
              ? 'Resend ayarları yapılandırılmış ve bağlantı başarılı'
              : 'Resend ayarları yapılandırılmış ancak bağlantı hatası var'
            : resendApiKey
              ? 'Resend ayarları eksik (EMAIL_FROM/RESEND_FROM yok)'
              : 'Resend ayarları yapılandırılmamış'
          : smtpConfigured
            ? connectionTest?.success
              ? 'SMTP ayarları yapılandırılmış ve bağlantı başarılı'
              : 'SMTP ayarları yapılandırılmış ancak bağlantı hatası var'
            : smtpPartiallyConfigured
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
