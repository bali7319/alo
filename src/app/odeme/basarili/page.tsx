'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PaymentData {
  listingId?: string;
  planType: string;
  planName: string;
  planPrice: number;
  premiumFeatures: string[];
  premiumFeaturesPrice: number;
  totalAmount: number;
  billingName: string;
  billingEmail: string;
  billingPhone?: string;
  billingAddress?: string;
  billingTaxId?: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createInvoiceAndRedirect = async () => {
      try {
        // localStorage'dan paymentData'yı al
        const storedData = typeof window !== 'undefined' ? localStorage.getItem('paymentData') : null;
        
        if (!storedData) {
          setError('Ödeme bilgileri bulunamadı');
          setIsCreatingInvoice(false);
          return;
        }

        const paymentData: PaymentData = JSON.parse(storedData);
        
        // Fatura oluştur
        const response = await fetch('/api/payment/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...paymentData,
            paymentMethod: 'paytr',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Fatura oluşturulamadı');
        }

        const result = await response.json();
        
        // localStorage'dan paymentData'yı temizle
        if (typeof window !== 'undefined') {
          localStorage.removeItem('paymentData');
        }

        // Fatura ekranına yönlendir
        router.push(`/fatura/${result.invoiceId}`);
      } catch (error: any) {
        console.error('Fatura oluşturma hatası:', error);
        setError(error.message || 'Fatura oluşturulurken bir hata oluştu');
        setIsCreatingInvoice(false);
      }
    };

    createInvoiceAndRedirect();
  }, [router]);

  if (isCreatingInvoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Fatura Oluşturuluyor...
            </h1>
            <p className="text-gray-600">
              Lütfen bekleyin, fatura bilgileriniz hazırlanıyor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Hata Oluştu
            </h1>
            
            <p className="text-gray-600 mb-8">
              {error}
            </p>
            
            <button
              onClick={() => router.push('/ilanlarim')}
              className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              İlanlarım Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 
