import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Fatura bulunamadı' },
        { status: 404 }
      );
    }

    // Excel (CSV) verisi varsa onu döndür, yoksa oluştur
    let excelData = invoice.excelData;
    
    if (!excelData) {
      // CSV oluştur
      excelData = `Fatura No,${invoice.invoiceNumber}
Fatura Tarihi,${invoice.createdAt.toISOString().split('T')[0]}
Müşteri Adı,${invoice.billingName}
E-posta,${invoice.billingEmail}
Telefon,${invoice.billingPhone || ''}
Adres,${invoice.billingAddress || ''}
Vergi No,${invoice.billingTaxId || ''}
Açıklama,${invoice.planName || 'İlan Yayınlama'}
Miktar,1
Birim Fiyat,${invoice.amount.toFixed(2)}
Ara Toplam,${invoice.amount.toFixed(2)}
KDV Oranı,${invoice.taxRate}%
KDV Tutarı,${invoice.taxAmount.toFixed(2)}
Toplam,${invoice.totalAmount.toFixed(2)}
Ödeme Durumu,${invoice.status}
Ödeme Tarihi,${invoice.paymentDate?.toISOString().split('T')[0] || ''}
Ödeme Yöntemi,${invoice.paymentMethod || ''}`;
    }

    return new NextResponse(excelData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="fatura-${invoice.invoiceNumber}.csv"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

