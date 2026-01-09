'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { contractTemplates, formatCurrency, formatDate, numberToTurkishOrdinal } from '@/lib/contract-templates';

interface Contract {
  id: string;
  title: string;
  type: string;
  content: string;
  version: string;
}

export default function SozlesmeOlusturPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (status === 'loading') return;

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      router.push(`/giris?callbackUrl=${encodeURIComponent(`/admin/sozlesmeler/${contractId}/olustur`)}`);
      return;
    }

    fetchContract();
  }, [session, status, router, contractId]);

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/admin/contracts/${contractId}`);
      if (!response.ok) throw new Error('Sözleşme yüklenemedi');
      const data = await response.json();
      setContract(data);
      
      // Tip'e göre varsayılan form verilerini yükle
      const template = contractTemplates[data.type];
      if (template) {
        setFormData(template.getDefaultFormData());
      }
    } catch (err) {
      console.error('Sözleşme yükleme hatası:', err);
      alert('Sözleşme yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Eşya listesi gibi özel alanlar için
    if (name === 'esyalar' && Array.isArray(value)) {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
      return;
    }
    
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Sözleşme bulunamadı</p>
      </div>
    );
  }

  const template = contractTemplates[contract.type];
  if (!template) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Bu sözleşme tipi için form şablonu henüz oluşturulmamış.</p>
        <Link href={`/admin/sozlesmeler/${contractId}`} className="text-blue-600 hover:underline mt-2 inline-block">
          Sözleşme detayına dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/sozlesmeler" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
                <p className="text-sm text-gray-600">Sözleşme oluştur ve yazdır</p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="h-5 w-5 mr-2" />
              Yazdır
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-1">
          {/* Sol Taraf - Form */}
          <div className="print:hidden lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 space-y-6" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {template.getFormFields(formData, handleInputChange)}
            </div>
          </div>

          {/* Sağ Taraf - Ön İzleme */}
          <div className="lg:sticky lg:top-8 lg:col-span-1 print:w-full" style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
            <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:p-0" style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '133.33%' }}>
              <div style={{ width: '210mm', minHeight: '297mm' }}>
                {template.renderPreview(formData)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            height: auto !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .a4-container {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20mm !important;
            width: 210mm !important;
            min-height: auto !important;
            max-height: 297mm !important;
            page-break-after: always;
            display: block !important;
            background: white !important;
          }
          .a4-container:last-child {
            page-break-after: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

