'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
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

// Template'i olan sözleşme tipleri
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

export default function SozlesmelerPage() {
  useEffect(() => {
    // Sayfa başlığını güncelle
    document.title = 'Hukuki Belgeler ve Dilekçe - Alo17';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hukuki Belgeler ve Dilekçe</h1>
          <p className="text-gray-600">İhtiyacınıza uygun hukuki belge ve dilekçe şablonlarını seçin ve oluşturun</p>
        </div>

        {/* Ev Kiralama Sözleşmesi - Özel Buton */}
        <div className="mb-6">
          <Link
            href="/sozlesmeler/ev-kiralama"
            className="flex items-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium shadow-md"
          >
            <FileText className="h-6 w-6 mr-3" />
            Ev Kiralama Sözleşmesi
          </Link>
        </div>

        {/* Diğer Template Tipleri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templateTypes
            .filter(t => t.type !== 'ev-kiralama' && contractTemplates[t.type])
            .map((templateInfo) => {
              const slug = createTurkishSlug(templateInfo.label);
              return (
                <Link
                  key={templateInfo.type}
                  href={`/sozlesmeler/${slug}`}
                  className="flex items-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-base font-medium shadow-md"
                >
                  <FileText className="h-5 w-5 mr-3" />
                  {templateInfo.label}
                </Link>
              );
            })}
        </div>

        {/* Bilgilendirme */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Bilgilendirme</h3>
          <p className="text-sm text-blue-800">
            Bu sayfada yer alan hukuki belge ve dilekçe şablonları bilgilendirme amaçlıdır. 
            Önemli hukuki işlemleriniz için mutlaka bir avukata danışmanızı öneririz.
          </p>
        </div>
      </div>
    </div>
  );
}
