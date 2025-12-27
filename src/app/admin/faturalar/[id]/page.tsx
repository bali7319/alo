'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Download, Mail, FileText, Calendar, User, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  listingId: string | null;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  planType: string | null;
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
  emailSent: boolean;
  emailSentAt: Date | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function FaturaDetayPage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/invoices/${params.id}`);
      if (!response.ok) {
        throw new Error('Fatura yüklenemedi');
      }

      const data = await response.json();
      setInvoice(data.invoice);
    } catch (error) {
      console.error('Fatura yükleme hatası:', error);
      alert('Fatura yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadXML = async () => {
    if (!invoice) return;
    try {
      const response = await fetch(`/api/admin/invoices/${invoice.id}/xml`);
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
      const response = await fetch(`/api/admin/invoices/${invoice.id}/excel`);
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

  const handleSendEmail = async () => {
    if (!invoice) return;
    if (!confirm('Fatura e-postası gönderilsin mi?')) return;

    try {
      const response = await fetch(`/api/admin/invoices/${invoice.id}/send-email`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('E-posta gönderilemedi');
      
      alert('Fatura e-postası başarıyla gönderildi');
      fetchInvoice(); // Faturayı yenile
    } catch (error) {
      console.error('E-posta gönderme hatası:', error);
      alert('E-posta gönderilemedi');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      pending: { label: 'Beklemede', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Ödendi', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'İptal', className: 'bg-red-100 text-red-800' },
    };
    
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Fatura bulunamadı</p>
        <Link href="/admin/faturalar" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Faturalar listesine dön
        </Link>
      </div>
    );
  }

  const premiumFeatures = invoice.premiumFeatures ? JSON.parse(invoice.premiumFeatures) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/faturalar"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fatura Detayı</h1>
            <p className="text-gray-600 mt-1">Fatura No: {invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadXML}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            XML İndir
          </button>
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Excel İndir
          </button>
          <button
            onClick={handleSendEmail}
            disabled={invoice.emailSent}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              invoice.emailSent
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            {invoice.emailSent ? 'E-posta Gönderildi' : 'E-posta Gönder'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fatura Bilgileri */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Fatura Bilgileri</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Fatura Numarası</label>
                <p className="text-lg font-medium text-gray-900">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Fatura Tarihi</label>
                <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(invoice.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Durum</label>
                <div className="mt-1">{getStatusBadge(invoice.status)}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Ödeme Yöntemi</label>
                <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {invoice.paymentMethod || '-'}
                </p>
              </div>
              {invoice.paymentDate && (
                <div>
                  <label className="text-sm text-gray-500">Ödeme Tarihi</label>
                  <p className="text-lg font-medium text-gray-900">{formatDate(invoice.paymentDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Müşteri Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Müşteri Bilgileri
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Ad Soyad / Firma Adı</label>
                <p className="text-lg font-medium text-gray-900">{invoice.billingName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">E-posta</label>
                <p className="text-lg font-medium text-gray-900">{invoice.billingEmail}</p>
              </div>
              {invoice.billingPhone && (
                <div>
                  <label className="text-sm text-gray-500">Telefon</label>
                  <p className="text-lg font-medium text-gray-900">{invoice.billingPhone}</p>
                </div>
              )}
              {invoice.billingAddress && (
                <div>
                  <label className="text-sm text-gray-500">Adres</label>
                  <p className="text-lg font-medium text-gray-900">{invoice.billingAddress}</p>
                </div>
              )}
              {invoice.billingTaxId && (
                <div>
                  <label className="text-sm text-gray-500">TC Kimlik No / Vergi No</label>
                  <p className="text-lg font-medium text-gray-900">{invoice.billingTaxId}</p>
                </div>
              )}
            </div>
          </div>

          {/* İlan Bilgileri */}
          {invoice.listingId && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">İlan Bilgileri</h2>
              <p className="text-gray-600">İlan ID: {invoice.listingId}</p>
            </div>
          )}
        </div>

        {/* Özet */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ödeme Özeti</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Plan</label>
                <p className="text-lg font-medium text-gray-900">{invoice.planName || '-'}</p>
              </div>

              {premiumFeatures.length > 0 && (
                <div>
                  <label className="text-sm text-gray-500">Premium Özellikler</label>
                  <ul className="mt-2 space-y-1">
                    {premiumFeatures.map((feature: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700">• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>KDV Hariç Tutar</span>
                  <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>KDV (%{invoice.taxRate})</span>
                  <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>Toplam</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            {invoice.emailSent && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-posta gönderildi: {formatDate(invoice.emailSentAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

