import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';

// Excel (CSV) formatında fatura oluştur
function generateInvoiceExcel(invoice: any): string {
  const premiumFeatures = invoice.premiumFeatures ? JSON.parse(invoice.premiumFeatures) : [];
  const premiumFeaturesStr = premiumFeatures.length > 0 ? premiumFeatures.join('; ') : '';

  return `Fatura No,${invoice.invoiceNumber}
Fatura Tarihi,${new Date(invoice.createdAt).toISOString().split('T')[0]}
Müşteri Adı,${invoice.billingName}
E-posta,${invoice.billingEmail}
Telefon,${invoice.billingPhone || ''}
Adres,${invoice.billingAddress || ''}
Vergi No,${invoice.billingTaxId || ''}
Plan Tipi,${invoice.planType || ''}
Plan Adı,${invoice.planName || 'İlan Yayınlama'}
Premium Özellikler,${premiumFeaturesStr}
Miktar,1
Birim Fiyat,${invoice.amount.toFixed(2)}
Ara Toplam,${invoice.amount.toFixed(2)}
KDV Oranı,${invoice.taxRate}%
KDV Tutarı,${invoice.taxAmount.toFixed(2)}
Toplam,${invoice.totalAmount.toFixed(2)}
Ödeme Durumu,${invoice.status}
Ödeme Tarihi,${invoice.paymentDate ? new Date(invoice.paymentDate).toISOString().split('T')[0] : ''}
Ödeme Yöntemi,${invoice.paymentMethod || ''}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    const body = await request.json();
    const { invoiceIds } = body;

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json(
        { error: 'Fatura ID\'leri gerekli' },
        { status: 400 }
      );
    }

    // Faturaları getir
    const invoices = await prisma.invoice.findMany({
      where: {
        id: { in: invoiceIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (invoices.length === 0) {
      return NextResponse.json(
        { error: 'Fatura bulunamadı' },
        { status: 404 }
      );
    }

    // CSV başlık satırı
    const csvHeader = 'Fatura No,Fatura Tarihi,Müşteri Adı,E-posta,Telefon,Adres,Vergi No,Plan Tipi,Plan Adı,Premium Özellikler,Miktar,Birim Fiyat,Ara Toplam,KDV Oranı,KDV Tutarı,Toplam,Ödeme Durumu,Ödeme Tarihi,Ödeme Yöntemi\n';

    // Tüm faturaları CSV formatında birleştir
    const csvRows = invoices.map((invoice: any) => {
      const premiumFeatures = invoice.premiumFeatures ? JSON.parse(invoice.premiumFeatures) : [];
      const premiumFeaturesStr = premiumFeatures.length > 0 ? premiumFeatures.join('; ') : '';
      
      return [
        invoice.invoiceNumber,
        new Date(invoice.createdAt).toISOString().split('T')[0],
        `"${invoice.billingName}"`,
        invoice.billingEmail,
        invoice.billingPhone || '',
        `"${invoice.billingAddress || ''}"`,
        invoice.billingTaxId || '',
        invoice.planType || '',
        `"${invoice.planName || 'İlan Yayınlama'}"`,
        `"${premiumFeaturesStr}"`,
        '1',
        invoice.amount.toFixed(2),
        invoice.amount.toFixed(2),
        `${invoice.taxRate}%`,
        invoice.taxAmount.toFixed(2),
        invoice.totalAmount.toFixed(2),
        invoice.status,
        invoice.paymentDate ? new Date(invoice.paymentDate).toISOString().split('T')[0] : '',
        invoice.paymentMethod || '',
      ].join(',');
    });

    const csvContent = csvHeader + csvRows.join('\n');

    // CSV dosyasını döndür
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="faturalar-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

