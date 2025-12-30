import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// HTML formatında fatura oluştur
function generateInvoiceHTML(invoice: any, user: any): string {
  const premiumFeatures = invoice.premiumFeatures ? JSON.parse(invoice.premiumFeatures) : [];
  const invoiceDate = new Date(invoice.createdAt).toLocaleDateString('tr-TR');
  const paymentDate = invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString('tr-TR') : '-';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fatura - ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .invoice-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .info-section {
      flex: 1;
    }
    .info-section h3 {
      color: #333;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .info-section p {
      color: #666;
      margin: 5px 0;
      font-size: 14px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table th,
    .items-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .items-table th {
      background: #f8f9fa;
      font-weight: bold;
      color: #333;
    }
    .summary {
      margin-top: 20px;
      text-align: right;
    }
    .summary-row {
      display: flex;
      justify-content: flex-end;
      margin: 8px 0;
    }
    .summary-label {
      width: 150px;
      text-align: right;
      color: #666;
    }
    .summary-value {
      width: 120px;
      text-align: right;
      font-weight: bold;
      color: #333;
    }
    .total {
      font-size: 20px;
      color: #2563eb;
      border-top: 2px solid #2563eb;
      padding-top: 10px;
      margin-top: 10px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <h1>FATURA</h1>
      <p>Fatura No: ${invoice.invoiceNumber}</p>
    </div>

    <div class="invoice-info">
      <div class="info-section">
        <h3>Fatura Bilgileri</h3>
        <p><strong>Tarih:</strong> ${invoiceDate}</p>
        <p><strong>Ödeme Yöntemi:</strong> ${invoice.paymentMethod || '-'}</p>
        <p><strong>Ödeme Tarihi:</strong> ${paymentDate}</p>
        <p><strong>Durum:</strong> ${invoice.status === 'paid' ? 'Ödendi' : invoice.status}</p>
      </div>
      <div class="info-section">
        <h3>Müşteri Bilgileri</h3>
        <p><strong>Ad Soyad:</strong> ${invoice.billingName}</p>
        <p><strong>E-posta:</strong> ${invoice.billingEmail}</p>
        ${invoice.billingPhone ? `<p><strong>Telefon:</strong> ${invoice.billingPhone}</p>` : ''}
        ${invoice.billingAddress ? `<p><strong>Adres:</strong> ${invoice.billingAddress}</p>` : ''}
        ${invoice.billingTaxId ? `<p><strong>Vergi No:</strong> ${invoice.billingTaxId}</p>` : ''}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Açıklama</th>
          <th style="text-align: right;">Miktar</th>
          <th style="text-align: right;">Birim Fiyat</th>
          <th style="text-align: right;">Toplam</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${invoice.planName || 'İlan Yayınlama'}</td>
          <td style="text-align: right;">1</td>
          <td style="text-align: right;">${invoice.amount.toFixed(2)} ₺</td>
          <td style="text-align: right;">${invoice.amount.toFixed(2)} ₺</td>
        </tr>
        ${premiumFeatures.length > 0 ? `
        <tr>
          <td colspan="4" style="padding-top: 10px;">
            <strong>Premium Özellikler:</strong>
            <ul style="margin-left: 20px; margin-top: 5px;">
              ${premiumFeatures.map((feature: string) => `<li>${feature}</li>`).join('')}
            </ul>
          </td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-row">
        <span class="summary-label">KDV Hariç Tutar:</span>
        <span class="summary-value">${invoice.amount.toFixed(2)} ₺</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">KDV (%${invoice.taxRate}):</span>
        <span class="summary-value">${invoice.taxAmount.toFixed(2)} ₺</span>
      </div>
      <div class="summary-row total">
        <span class="summary-label">TOPLAM:</span>
        <span class="summary-value">${invoice.totalAmount.toFixed(2)} ₺</span>
      </div>
    </div>

    <div class="footer">
      <p>Bu fatura elektronik ortamda oluşturulmuştur.</p>
      <p>Alo17 - Çanakkale İlan Sitesi</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { invoiceIds } = body;

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json(
        { error: 'Fatura ID\'leri gerekli' },
        { status: 400 }
      );
    }

    // Faturaları getir
    const invoices = await (prisma as any).invoice.findMany({
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
    });

    if (invoices.length === 0) {
      return NextResponse.json(
        { error: 'Fatura bulunamadı' },
        { status: 404 }
      );
    }

    // Tüm faturaları HTML formatında birleştir
    const htmlContent = invoices.map((invoice: any) => {
      return generateInvoiceHTML(invoice, invoice.user);
    }).join('<div style="page-break-after: always;"></div>');

    // HTML dosyasını döndür
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="faturalar-${new Date().toISOString().split('T')[0]}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Toplu HTML indirme hatası:', error);
    return NextResponse.json(
      { error: 'HTML dosyası oluşturulamadı', details: error.message },
      { status: 500 }
    );
  }
}

