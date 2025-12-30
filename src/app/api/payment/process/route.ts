import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Fatura numarası oluştur
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
}

// XML formatında fatura oluştur
function generateInvoiceXML(invoice: any, user: any): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice>
  <InvoiceNumber>${invoice.invoiceNumber}</InvoiceNumber>
  <InvoiceDate>${invoice.createdAt.toISOString().split('T')[0]}</InvoiceDate>
  <Customer>
    <Name>${invoice.billingName}</Name>
    <Email>${invoice.billingEmail}</Email>
    <Phone>${invoice.billingPhone || ''}</Phone>
    <Address>${invoice.billingAddress || ''}</Address>
    <TaxId>${invoice.billingTaxId || ''}</TaxId>
  </Customer>
  <Items>
    <Item>
      <Description>${invoice.planName || 'İlan Yayınlama'}</Description>
      <Quantity>1</Quantity>
      <UnitPrice>${invoice.amount.toFixed(2)}</UnitPrice>
      <Total>${invoice.amount.toFixed(2)}</Total>
    </Item>
  </Items>
  <Summary>
    <SubTotal>${invoice.amount.toFixed(2)}</SubTotal>
    <TaxRate>${invoice.taxRate}%</TaxRate>
    <TaxAmount>${invoice.taxAmount.toFixed(2)}</TaxAmount>
    <Total>${invoice.totalAmount.toFixed(2)}</Total>
  </Summary>
  <Payment>
    <Status>${invoice.status}</Status>
    <PaymentDate>${invoice.paymentDate?.toISOString().split('T')[0] || ''}</PaymentDate>
    <PaymentMethod>${invoice.paymentMethod || ''}</PaymentMethod>
  </Payment>
</Invoice>`;
  return xml;
}

// Excel formatında fatura oluştur (CSV formatında)
function generateInvoiceExcel(invoice: any, user: any): string {
  const csv = `Fatura No,${invoice.invoiceNumber}
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
  return csv;
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

    const body = await request.json();
    const {
      listingId,
      planType,
      planName,
      planPrice,
      premiumFeatures,
      premiumFeaturesPrice,
      totalAmount,
      billingName,
      billingEmail,
      billingPhone,
      billingAddress,
      billingTaxId,
      paymentMethod,
    } = body;

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // KDV hesaplama (%20)
    const taxRate = 20;
    const amountWithoutTax = totalAmount / (1 + taxRate / 100);
    const taxAmount = totalAmount - amountWithoutTax;

    // Fatura numarası oluştur
    let invoiceNumber = generateInvoiceNumber();
    // Benzersizlik kontrolü
    let existingInvoice = await (prisma as any).invoice.findUnique({
      where: { invoiceNumber },
    });
    while (existingInvoice) {
      invoiceNumber = generateInvoiceNumber();
      existingInvoice = await (prisma as any).invoice.findUnique({
        where: { invoiceNumber },
      });
    }

    // Fatura oluştur
    const invoice = await (prisma as any).invoice.create({
      data: {
        invoiceNumber,
        userId: user.id,
        listingId: listingId || null,
        amount: amountWithoutTax,
        taxRate,
        taxAmount,
        totalAmount,
        planType: planType || null,
        planName: planName || null,
        premiumFeatures: premiumFeatures ? JSON.stringify(premiumFeatures) : null,
        status: 'paid',
        paymentMethod: paymentMethod || 'credit_card',
        paymentDate: new Date(),
        billingName,
        billingEmail,
        billingPhone: billingPhone || null,
        billingAddress: billingAddress || null,
        billingTaxId: billingTaxId || null,
        emailSent: false,
      },
    });

    // XML ve Excel verilerini oluştur
    const xmlData = generateInvoiceXML(invoice, user);
    const excelData = generateInvoiceExcel(invoice, user);

    // Faturayı güncelle (XML ve Excel verilerini ekle)
    const updatedInvoice = await (prisma as any).invoice.update({
      where: { id: invoice.id },
      data: {
        xmlData,
        excelData,
      },
    });

    // İlan varsa onay durumunu güncelle
    if (listingId) {
      await prisma.listing.update({
        where: { id: listingId },
        data: {
          approvalStatus: 'pending', // Ödeme sonrası onaya gönderildi
        },
      });
    }

    // Email gönderme (async olarak)
    // TODO: Email servisi entegrasyonu yapılacak
    // sendInvoiceEmail(invoice, user);

    return NextResponse.json(
      {
        success: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        message: 'Ödeme başarıyla tamamlandı ve fatura oluşturuldu',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Ödeme işleme hatası:', error);
    return NextResponse.json(
      {
        error: 'Ödeme işlemi sırasında bir hata oluştu',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

