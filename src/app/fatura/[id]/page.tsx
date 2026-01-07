'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Download, FileText, Mail, Calendar, User, CreditCard, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoiceNumber: string;
  listingId: string | null;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  planName: string | null;
  premiumFeatures: string | null;
  status: string;
  paymentMethod: string | null;
  paymentDate: Date | null;
  billingName: string;
  billingEmail: string;
  billingPhone: string | null;
  billingAddress: string | null;
  billingTaxId: string | null;
  createdAt: Date;
}

interface Listing {
  id: string;
  approvalStatus: string;
}

export default function FaturaPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.id && session) {
      fetchInvoice();
    }
  }, [params.id, session]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${params.id}`);
      if (!response.ok) {
        throw new Error('Fatura yüklenemedi');
      }

      const data = await response.json();
      setInvoice(data.invoice);

      // İlan bilgisini de al
      if (data.invoice.listingId) {
        try {
          const listingResponse = await fetch(`/api/listings/${data.invoice.listingId}`);
          if (listingResponse.ok) {
            const listingData = await listingResponse.json();
            setListing(listingData.listing);
          }
        } catch (error) {
          console.error('İlan yükleme hatası:', error);
        }
      }
    } catch (error) {
      console.error('Fatura yükleme hatası:', error);
      alert('Fatura yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!invoice?.listingId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/listings/${invoice.listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalStatus: 'pending',
        }),
      });

      if (!response.ok) {
        throw new Error('İlan onaya gönderilemedi');
      }

      // İlan durumunu güncelle
      if (listing) {
        setListing({ ...listing, approvalStatus: 'pending' });
      }

      alert('İlanınız başarıyla onaya gönderildi. Moderatör onayından sonra yayınlanacaktır.');
    } catch (error: any) {
      console.error('Onaya gönderme hatası:', error);
      alert(error.message || 'İlan onaya gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadXML = async () => {
    if (!invoice) return;
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/xml`);
      if (!response.ok) throw new Error('XML indirilemedi');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fatura-${invoice.invoiceNumber}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('XML indirme hatası:', error);
      alert('XML dosyası indirilemedi');
    }
  };

  const handleDownloadExcel = async () => {
    if (!invoice) return;
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/excel`);
      if (!response.ok) throw new Error('Excel indirilemedi');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fatura-${invoice.invoiceNumber}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Excel indirme hatası:', error);
      alert('Excel dosyası indirilemedi');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Fatura bulunamadı</p>
          <Link href="/ilanlarim" className="text-blue-600 hover:text-blue-800">
            İlanlarım sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  const premiumFeatures = invoice.premiumFeatures ? JSON.parse(invoice.premiumFeatures) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/ilanlarim"
            className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            İlanlarım
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fatura</h1>
              <p className="text-gray-600 mt-1">Fatura No: {invoice.invoiceNumber}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadXML}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                XML
              </button>
              <button
                onClick={handleDownloadExcel}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>

          {/* İlan Onay Durumu */}
          {invoice.listingId && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Ödeme Başarılı!
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Faturanız başarıyla oluşturuldu.
                    {listing?.approvalStatus === 'pending' ? (
                      <span className="block mt-2 font-medium">
                        ✅ İlanınız moderatör onayına gönderildi. Onaylandıktan sonra yayınlanacaktır.
                      </span>
                    ) : listing?.approvalStatus === 'approved' ? (
                      <span className="block mt-2 font-medium text-green-700">
                        ✅ İlanınız onaylandı ve yayında!
                      </span>
                    ) : (
                      <span className="block mt-2">
                        İlanınızı onaya göndermek için aşağıdaki butona tıklayın.
                      </span>
                    )}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {listing?.approvalStatus !== 'pending' && listing?.approvalStatus !== 'approved' ? (
                      <button
                        onClick={handleSubmitForApproval}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            İlanı Onaya Gönder
                          </>
                        )}
                      </button>
                    ) : null}
                    <button
                      onClick={() => router.push('/ilanlarim')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      İlan Onay Durumunu Görüntüle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Fatura Bilgileri</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Fatura Tarihi:</span>
                  <p className="text-gray-900">{formatDate(invoice.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Ödeme Yöntemi:</span>
                  <p className="text-gray-900">{invoice.paymentMethod || '-'}</p>
                </div>
                {invoice.paymentDate && (
                  <div>
                    <span className="text-sm text-gray-500">Ödeme Tarihi:</span>
                    <p className="text-gray-900">{formatDate(invoice.paymentDate)}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Ad Soyad:</span>
                  <p className="text-gray-900">{invoice.billingName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">E-posta:</span>
                  <p className="text-gray-900">{invoice.billingEmail}</p>
                </div>
                {invoice.billingPhone && (
                  <div>
                    <span className="text-sm text-gray-500">Telefon:</span>
                    <p className="text-gray-900">{invoice.billingPhone}</p>
                  </div>
                )}
                {invoice.billingAddress && (
                  <div>
                    <span className="text-sm text-gray-500">Adres:</span>
                    <p className="text-gray-900">{invoice.billingAddress}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Detayları</h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Plan:</span>
                <p className="text-gray-900">{invoice.planName || '-'}</p>
              </div>
              {premiumFeatures.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">Premium Özellikler:</span>
                  <ul className="mt-1 space-y-1">
                    {premiumFeatures.map((feature: string, index: number) => (
                      <li key={index} className="text-gray-900">• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-end">
              <div className="w-full md:w-64 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>KDV Hariç Tutar:</span>
                  <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>KDV (%{invoice.taxRate}):</span>
                  <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
                  <span>Toplam:</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

