import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const invoice = await (prisma as any).invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Fatura bulunamadı' },
        { status: 404 }
      );
    }

    // Fatura sahibi kontrolü
    if (invoice.userId !== user.id) {
      return NextResponse.json(
        { error: 'Bu faturaya erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // XML verisi varsa onu döndür, yoksa oluştur
    let xmlData = invoice.xmlData;
    
    if (!xmlData) {
      xmlData = `<?xml version="1.0" encoding="UTF-8"?>
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
    }

    return new NextResponse(xmlData, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="fatura-${invoice.invoiceNumber}.xml"`,
      },
    });
  } catch (error: any) {
    console.error('XML indirme hatası:', error);
    return NextResponse.json(
      { error: 'XML dosyası oluşturulamadı', details: error.message },
      { status: 500 }
    );
  }
}

