import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// PayTR API bilgileri
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'R6754UcJuF1P1B8h';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'Y2GjjCwCGWdDsYaQ';

// Fatura numarası oluştur
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const merchant_oid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const total_amount = formData.get('total_amount') as string;
    const hash = formData.get('hash') as string;
    const failed_reason_code = formData.get('failed_reason_code') as string;
    const failed_reason_msg = formData.get('failed_reason_msg') as string;
    const test_mode = formData.get('test_mode') as string;
    const payment_type = formData.get('payment_type') as string;
    const currency = formData.get('currency') as string;
    const payment_amount = formData.get('payment_amount') as string;

    console.log('PayTR Webhook alındı:', {
      merchant_oid,
      status,
      total_amount,
      test_mode,
      payment_type,
      currency,
    });

    if (!merchant_oid) {
      console.error('PayTR webhook: merchant_oid eksik');
      return NextResponse.json(
        { error: 'Merchant OID gerekli' },
        { status: 400 }
      );
    }

    // PayTR hash doğrulama
    const hash_str = `${PAYTR_MERCHANT_SALT}${merchant_oid}${status}${total_amount}`;
    const calculated_hash = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hash_str).digest('base64');

    if (calculated_hash !== hash) {
      console.error('PayTR webhook hash doğrulama hatası:', { 
        calculated_hash, 
        received_hash: hash,
        hash_str,
        merchant_oid,
        status,
        total_amount,
      });
      return NextResponse.json(
        { error: 'Hash doğrulama hatası' },
        { status: 400 }
      );
    }

    // merchant_oid'den listingId'yi bul (format: alo17{listingIdHash}{timestamp})
    let listingId: string | null = null;
    
    if (merchant_oid.startsWith('alo17') && merchant_oid.length >= 29) {
      const withoutPrefix = merchant_oid.substring(5); // 'alo17' prefix'ini kaldır
      const listingIdHash = withoutPrefix.substring(0, 16); // İlk 16 karakter hash
      
      try {
        // Son 100 ilanı kontrol et (performans için optimize edilebilir)
        const listings = await prisma.listing.findMany({
          select: { id: true },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        
        for (const listing of listings) {
          const hash = crypto.createHash('md5').update(listing.id).digest('hex').substring(0, 16);
          if (hash === listingIdHash) {
            listingId = listing.id;
            break;
          }
        }
      } catch (error) {
        console.error('PayTR webhook: listingId bulma hatası:', error);
        listingId = null;
      }
    }

    if (status === 'success') {
      // Ödeme başarılı
      let invoiceId: string | null = null;
      
      if (listingId) {
        // İlanı ve kullanıcıyı bul
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
          include: {
            user: true,
          },
        });

        if (listing) {
          // İlanı premium yap ve onaya gönder
          await prisma.listing.update({
            where: { id: listingId },
            data: {
              isPremium: true,
              premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
              approvalStatus: 'pending', // Ödeme sonrası onaya gönderildi
            },
          });

          // Fatura oluştur (eğer daha önce oluşturulmamışsa)
          const existingInvoice = await prisma.invoice.findFirst({
            where: {
              listingId: listingId,
              status: 'paid',
            },
          });

          if (!existingInvoice) {
            // KDV hesaplama (%20)
            const taxRate = 20;
            const totalAmount = parseFloat(total_amount) / 100; // Kuruştan TL'ye çevir
            const amountWithoutTax = totalAmount / (1 + taxRate / 100);
            const taxAmount = totalAmount - amountWithoutTax;

            // Premium özelliklerini parse et
            let premiumFeatures: string[] = [];
            if (listing.premiumFeatures) {
              try {
                const parsed = typeof listing.premiumFeatures === 'string' 
                  ? JSON.parse(listing.premiumFeatures) 
                  : listing.premiumFeatures;
                premiumFeatures = Array.isArray(parsed) ? parsed : Object.keys(parsed).filter(k => parsed[k]);
              } catch (e) {
                console.error('Premium features parse hatası:', e);
              }
            }

            // Plan tipini belirle (premiumUntil'a göre)
            let planType = 'none';
            let planName = 'Ücretsiz';
            if (listing.premiumUntil) {
              const daysUntil = Math.ceil((listing.premiumUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              if (daysUntil <= 30) {
                planType = 'monthly';
                planName = 'Aylık Premium';
              } else if (daysUntil <= 90) {
                planType = 'quarterly';
                planName = '3 Aylık Premium';
              } else {
                planType = 'yearly';
                planName = 'Yıllık Premium';
              }
            }

            // Fatura numarası oluştur
            let invoiceNumber = generateInvoiceNumber();
            let invoiceExists = await prisma.invoice.findUnique({
              where: { invoiceNumber },
            });
            while (invoiceExists) {
              invoiceNumber = generateInvoiceNumber();
              invoiceExists = await prisma.invoice.findUnique({
                where: { invoiceNumber },
              });
            }

            // Fatura oluştur
            const invoice = await prisma.invoice.create({
              data: {
                invoiceNumber,
                userId: listing.userId,
                listingId: listingId,
                amount: amountWithoutTax,
                taxRate,
                taxAmount,
                totalAmount,
                planType: planType,
                planName: planName,
                premiumFeatures: premiumFeatures.length > 0 ? JSON.stringify(premiumFeatures) : null,
                status: 'paid',
                paymentMethod: payment_type || 'credit_card',
                paymentDate: new Date(),
                billingName: listing.user.name || 'Kullanıcı',
                billingEmail: listing.user.email,
                billingPhone: listing.phone || null,
                billingAddress: listing.location || null,
                billingTaxId: null,
                emailSent: false,
              },
            });

            invoiceId = invoice.id;

            console.log('PayTR webhook: Fatura oluşturuldu', {
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              listingId,
            });
          } else {
            invoiceId = existingInvoice.id;
            console.log('PayTR webhook: Fatura zaten mevcut', {
              invoiceId: existingInvoice.id,
              listingId,
            });
          }
        }
      }

      // Ödeme kaydını logla
      console.log('PayTR webhook: Ödeme başarılı', {
        merchant_oid,
        listingId,
        invoiceId,
        total_amount,
        payment_type,
        currency,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ 
        status: 'success',
        listingId,
        invoiceId,
        merchant_oid 
      }, { status: 200 });
    } else {
      // Ödeme başarısız
      if (listingId) {
        // İlanı bul ve premium durumunu kontrol et
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
        });

        if (listing) {
          // Ödeme başarısız olduğunda, eğer ilan premium olarak işaretlenmişse
          // (ödeme yapılmadan premium yapılmışsa) premium'u kaldır
          // Ama normalde ilan oluşturulurken isPremium: false olmalı
          // Bu sadece güvenlik için
          if (listing.isPremium && !listing.premiumUntil) {
            // Premium olarak işaretlenmiş ama premiumUntil yok, bu hatalı durum
            // Premium'u kaldır
            await prisma.listing.update({
              where: { id: listingId },
              data: {
                isPremium: false,
                premiumUntil: null,
                // approvalStatus'u değiştirme, zaten pending olabilir
              },
            });
            console.log('PayTR webhook: Ödeme başarısız - Premium durumu düzeltildi', {
              listingId,
            });
          }
        }
      }

      console.log('PayTR webhook: Ödeme başarısız', {
        merchant_oid,
        listingId,
        failed_reason_code,
        failed_reason_msg,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ status: 'failed' }, { status: 200 });
    }
  } catch (error) {
    console.error('PayTR webhook hatası:', error);
    return NextResponse.json(
      { error: 'Webhook işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

