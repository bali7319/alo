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

    if (!invoice) {
      return NextResponse.json(
        { error: 'Fatura bulunamadı' },
        { status: 404 }
      );
    }

    // XML verisi varsa onu döndür, yoksa oluştur
    let xmlData = invoice.xmlData;
    
    if (!xmlData) {
      // XML oluştur
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
  } catch (error) {
    return handleApiError(error);
  }
}

