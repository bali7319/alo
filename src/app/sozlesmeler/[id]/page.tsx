'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { contractTemplates } from '@/lib/contract-templates';

// Bu sayfanın dinamik olarak render edilmesini sağlar
export const dynamic = 'force-dynamic';

// Türkçe slug oluşturma fonksiyonu
const createTurkishSlug = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Template tipleri ve label'ları
const templateTypes = [
  { type: 'housing-transfer', label: 'Konut Devir Protokolü' },
  { type: 'sublease-approval', label: 'Alt Kira Onay' },
  { type: 'eviction-petition', label: 'Tahliye Dava Dilekçesi' },
  { type: 'rent-determination', label: 'Kira Tespit Dava Dilekçesi' },
  { type: 'eviction-notice', label: 'Tahliye İhtarname' },
  { type: 'rent-increase-notice', label: 'Kira Artış İhtarname' },
  { type: 'rent-receipt', label: 'Kira Ödeme Belgesi' },
  { type: 'rent-delay-notice', label: 'Kira Gecikme İhtarname' },
  { type: 'deposit-refund', label: 'Depozito İade' },
  { type: 'tenant-termination', label: 'Kiracı Fesih Bildirimi' },
  { type: 'rent-termination', label: 'Kira Fesih Protokolü' },
  { type: 'rent-renewal', label: 'Kira Yenileme' },
  { type: 'sublease', label: 'Alt Kira' },
  { type: 'rent-increase-objection', label: 'Kira Artış İtiraz' },
  { type: 'renovation-request', label: 'Tadilat Talebi' },
  { type: 'furnished-housing', label: 'Eşyalı Konut' },
  { type: 'construction-agreement', label: 'Kat Karşılığı İnşaat' },
  { type: 'vehicle', label: 'Araç Kiralama' },
  { type: 'warehouse', label: 'Depo Kiralama' },
  { type: 'sale', label: 'Satış Sözleşmesi' },
  { type: 'service', label: 'Hizmet Sözleşmesi' },
  { type: 'partnership', label: 'Ortaklık Sözleşmesi' },
  { type: 'parent-consent', label: 'Veli İzin Belgesi' },
  { type: 'student-permission', label: 'Öğrenci İzin Dilekçesi' },
  { type: 'divorce-agreement', label: 'Anlaşmalı Boşanma Sözleşmesi' },
  { type: 'criminal-record-statement', label: 'Sabıka Kaydı Beyanı' },
  { type: 'movable-property-loan', label: 'Taşınır Eşya Ödüncü Sözleşmesi' },
  { type: 'movable-rental', label: 'Taşınır Kiralama Sözleşmesi' },
  { type: 'neighbor-complaint-letter', label: 'Rahatsızlıkla İlgili Komşuya Mektup' },
  { type: 'security-deposit-refund', label: 'Güvence Bedeli İade Talebi' },
  { type: 'visa-invitation-letter', label: 'Vize Başvurusu Davet Mektubu' },
  { type: 'address-change-notification', label: 'Adres Değişikliği Bildirimi' },
  { type: 'long-term-vehicle-rental', label: 'Uzun Dönem Araç Kiralama Sözleşmesi' },
  { type: 'storage-agreement', label: 'Saklama Sözleşmesi' },
  { type: 'household-service-agreement', label: 'Ev İşleri İçin Hizmet Sözleşmesi' },
  { type: 'bank-account-closure', label: 'Banka Hesabını Kapatma Dilekçesi' },
  { type: 'pool-maintenance-agreement', label: 'Havuz Bakımına İlişkin Sözleşme' },
  { type: 'vehicle-sale-promise', label: 'Araç Satış Vaadi Sözleşmesi' },
  { type: 'diploma-request', label: 'Diploma Talebi Dilekçesi' },
  { type: 'grade-objection-primary-secondary', label: 'İlköğretim ve Ortaöğretim Not İtiraz Dilekçesi' },
  { type: 'credit-card-closure', label: 'Kredi Kartı Kapatma Dilekçesi' },
  { type: 'name-change-request', label: 'İsim Değişikliği Talep Dilekçesi' },
  { type: 'university-grade-objection', label: 'Üniversite Not İtiraz Dilekçesi' },
  { type: 'green-passport-cadre-request', label: 'Yeşil Pasaport İçin Kadro Derecesi Gösterir Belge Talebi' },
  { type: 'surname-change-notification', label: 'Soyadı Değişikliği Bildirimi' },
  { type: 'high-school-grade-objection', label: 'Lise Not İtiraz Dilekçesi' },
  { type: 'guardianship-appointment', label: 'Vasi Atanması Dilekçesi' },
  { type: 'excuse-exam-petition', label: 'Mazeret Sınav Dilekçesi' },
  { type: 'widow-orphan-pension-request', label: 'Dul/Yetim Aylığı Bağlanması İçin Talep Dilekçesi' },
  { type: 'judicial-control-objection', label: 'Adli Kontrol Kararına İtiraz Dilekçesi' },
  { type: 'detention-objection', label: 'Tutukluluğa İtiraz Dilekçesi' },
  { type: 'eviction-need-lawsuit', label: 'Konutun İhtiyaç Sebebiyle Tahliyesine İlişkin Dava Dilekçesi' },
  { type: 'foreclosure-objection', label: 'Haciz Takibine İtiraz Dilekçesi' },
  { type: 'enforcement-objection', label: 'İlamlı İcra Takibine İtiraz Dilekçesi' },
  { type: 'alimony-reduction-lawsuit', label: 'Nafakanın Azaltılması veya Kaldırılması İçin Dava Dilekçesi' },
  { type: 'alimony-increase-lawsuit', label: 'Nafakanın Artırılması Dava Dilekçesi' },
  { type: 'alimony-nonpayment-complaint', label: 'Boşanma Sonrasında Nafakanın Ödenmemesine İlişkin Şikayet Dilekçesi' },
  { type: 'insolvency-certificate-request', label: 'Aciz Belgesi Verilmesi Talebi' },
  { type: 'disable-auto-billing', label: 'Otomatik Faturalandırmayı Devre Dışı Bırakma Mektubu' },
  { type: 'line-cancellation', label: 'Hat İptal Dilekçesi' },
  { type: 'invoice-objection', label: 'Fatura İtiraz Dilekçesi' },
  { type: 'subscription-cancellation', label: 'Abonelik İptal Dilekçesi' },
  { type: 'defense-letter', label: 'Savunma Yazısı' },
  { type: 'flexible-work-request', label: 'İşçinin Esnek Çalışma Talebi Dilekçesi' },
  { type: 'caregiver-service-contract', label: 'Bakıcı ve Yardımcı Hizmetli İş Sözleşmesi' },
  { type: 'retirement-request', label: 'Emeklilik Talebi Dilekçesi' },
  { type: 'dismissal-reason-request', label: 'İşten Çıkarılma Nedenini Öğrenme Talebi Mektubu' },
  { type: 'job-offer-response', label: 'İş Teklifi Kabul veya Ret Mektubu' },
  { type: 'salary-increase-request', label: 'Maaş Artırımı Talebi' },
  { type: 'unjust-termination-compensation-lawsuit', label: 'İş Sözleşmesinin Haksız Feshi Halinde Tazminat Talebi Dava Dilekçesi' },
  { type: 'justified-termination-receivables-lawsuit', label: 'İş Sözleşmesinin İşçi Tarafından Haklı Nedenle Feshi Halinde Alacak Davası Dilekçesi' },
  { type: 'resignation-letter', label: 'İstifa Mektubu' },
  { type: 'post-birth-partial-work-request', label: 'Doğum Sonrası Kısmi Çalışma Talebi Mektubu' },
  { type: 'adoption-unpaid-leave-request', label: 'Evlat Edinme Sonrası Ücretsiz İzin Talebi Dilekçesi' },
  { type: 'employee-unpaid-leave-request', label: 'Çalışanın İşverenden Ücretsiz İzin Talebi Dilekçesi' },
  { type: 'paternity-leave-request', label: 'Babalık İzni Dilekçesi' },
  { type: 'maternity-leave-request', label: 'Analık (Doğum) İzni Dilekçesi' },
  { type: 'annual-paid-leave-request', label: 'Senelik Ücretli İzin Dilekçesi' },
  { type: 'post-birth-six-month-unpaid-leave', label: 'Doğum Sonrası Altı Aylık Ücretsiz İzin Talebi Dilekçesi' },
  { type: 'post-birth-half-day-unpaid-leave', label: 'Doğum Sonrası Yarım Gün Ücretsiz İzin Talebi Mektubu' },
];

// Türkçe slug'dan İngilizce type'a çevirme - Otomatik oluşturuluyor
const turkishSlugToType: { [key: string]: string } = templateTypes.reduce((acc, curr) => {
  const slug = createTurkishSlug(curr.label);
  acc[slug] = curr.type;
  return acc;
}, {} as { [key: string]: string });

// Ev-kiralama için özel slug
turkishSlugToType['ev-kiralama'] = 'ev-kiralama';

const getTemplateLabel = (type: string): string => {
  const found = templateTypes.find(t => t.type === type);
  return found ? found.label : type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function SozlesmeDetayPage() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;
  const [formData, setFormData] = useState<any>({});

  // Türkçe slug'dan İngilizce type'a çevir
  const actualType = turkishSlugToType[paramId] || paramId;
  const isTemplateType = contractTemplates[actualType] || actualType === 'ev-kiralama';
  const template = contractTemplates[actualType];

  useEffect(() => {
    // Sayfa başlığını güncelle
    const label = getTemplateLabel(actualType);
    document.title = `${label} - Hukuki Belgeler ve Dilekçe - Alo17`;

    // Ev-kiralama özel sayfaya yönlendir
    if (actualType === 'ev-kiralama') {
      router.replace('/sozlesmeler/ev-kiralama');
      return;
    }

    // Template type ise form verilerini yükle
    if (isTemplateType && template) {
      const defaultData = template.getDefaultFormData();
      setFormData(defaultData);
    }
  }, [paramId, actualType, isTemplateType, template, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Ev Kiralama özel sayfası için yönlendirme
  if (actualType === 'ev-kiralama') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Template type ise form ve önizleme göster
  if (isTemplateType && template) {
    return (
      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Header */}
        <div className="bg-white border-b shadow-sm print:hidden">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/sozlesmeler" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{getTemplateLabel(actualType)}</h1>
                  <p className="text-sm text-gray-600">Dilekçe oluştur ve yazdır</p>
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
              <form className="bg-white rounded-lg shadow p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {template.getFormFields(formData, handleInputChange)}
              </form>
            </div>

            {/* Sağ Taraf - Ön İzleme */}
            <div className="lg:sticky lg:top-8 lg:col-span-1 print:w-full" style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
              <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:p-0" style={{ transform: 'scale(0.65)', transformOrigin: 'top center', width: '153.85%', marginLeft: '-26.92%' }}>
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
            .preview-container {
              transform: none !important;
              width: 100% !important;
              margin-left: 0 !important;
            }
            .a4-container, .a4-page {
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
            .a4-container:last-child, .a4-page:last-child {
              page-break-after: auto !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // Template bulunamadıysa
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-2">Bu dilekçe tipi için form şablonu henüz oluşturulmamış.</p>
          <Link href="/sozlesmeler" className="text-blue-600 hover:underline">
            Geri dön
          </Link>
        </div>
      </div>
    </div>
  );
}
