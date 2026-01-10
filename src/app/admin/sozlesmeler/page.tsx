'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, Edit, Trash2, Eye, CheckCircle, XCircle, Search } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  type: string;
  version: string;
  isActive: boolean;
  isRequired: boolean;
  language: string;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSozlesmelerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      // window.location kullanarak RSC payload hatasını önle
      try {
        router.push(`/giris?callbackUrl=${encodeURIComponent('/admin/sozlesmeler')}`);
      } catch (error) {
        // Fallback: window.location kullan
        window.location.href = `/giris?callbackUrl=${encodeURIComponent('/admin/sozlesmeler')}`;
      }
      return;
    }

    // Session varsa ve admin ise verileri yükle
    if (session && userRole === 'admin') {
      fetchContracts();
    }
  }, [session, status, router]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/contracts', {
        cache: 'no-store',
        credentials: 'include',
      });
      
      // Response'un JSON olup olmadığını kontrol et
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API Response (not JSON):', text.substring(0, 200));
        throw new Error('Sunucudan beklenen JSON yanıtı alınamadı');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: Hukuki belgeler yüklenemedi`;
        console.error('API Error:', errorData);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setContracts(Array.isArray(data) ? data : []);
      // Başarılı yükleme sonrası hata mesajını temizle
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Hukuki belgeler yüklenirken hata oluştu';
      setError(errorMessage);
      console.error('Hukuki belgeler yükleme hatası:', err);
      // Hata durumunda bile boş array set et (sayfa çalışmaya devam etsin)
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hukuki belgeyi silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/contracts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Hukuki belge silinemedi');
      }

      setContracts(contracts.filter(c => c.id !== id));
    } catch (err) {
      alert('Hukuki belge silinirken hata oluştu');
      console.error('Hukuki belge silme hatası:', err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/contracts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Hukuki belge durumu güncellenemedi');
      }

      setContracts(contracts.map(c => 
        c.id === id ? { ...c, isActive: !currentStatus } : c
      ));
    } catch (err) {
      alert('Hukuki belge durumu güncellenirken hata oluştu');
      console.error('Hukuki belge güncelleme hatası:', err);
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.type !== 'commercial' && (
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'user': 'Kullanıcı Sözleşmesi',
      'seller': 'Satıcı Sözleşmesi',
      'buyer': 'Alıcı Sözleşmesi',
      'premium': 'Premium Üyelik',
      'general': 'Genel Şartlar',
      'privacy': 'Gizlilik Politikası',
      'terms': 'Kullanım Şartları',
      'commercial': 'İşyeri Kiralama',
      'vehicle': 'Araç Kiralama',
      'warehouse': 'Depo Kiralama',
      'sale': 'Satış Sözleşmesi',
      'service': 'Hizmet Sözleşmesi',
      'partnership': 'Ortaklık Sözleşmesi',
      'housing-transfer': 'Konut Devir Protokolü',
      'sublease-approval': 'Alt Kira Onay',
      'furnished-housing': 'Eşyalı Konut',
      'eviction-petition': 'Tahliye Dava Dilekçesi',
      'rent-determination': 'Kira Tespit Dava Dilekçesi',
      'construction-agreement': 'Kat Karşılığı İnşaat',
      'rent-increase-objection': 'Kira Artış İtiraz',
      'rent-renewal': 'Kira Yenileme',
      'eviction-notice': 'Tahliye İhtarname',
      'sublease': 'Alt Kira',
      'rent-increase-notice': 'Kira Artış İhtarname',
      'rent-termination': 'Kira Fesih Protokolü',
      'deposit-refund': 'Depozito İade',
      'rent-receipt': 'Kira Ödeme Belgesi',
      'tenant-termination': 'Kiracı Fesih Bildirimi',
      'rent-delay-notice': 'Kira Gecikme İhtarname',
      'renovation-request': 'Tadilat Talebi',
      // Yeni eklenen sözleşmeler
      'parent-consent': 'Veli İzin Belgesi',
      'student-permission': 'Öğrenci İzin Dilekçesi',
      'divorce-agreement': 'Anlaşmalı Boşanma Sözleşmesi',
      'criminal-record-statement': 'Sabıka Kaydı Beyanı',
      'movable-property-loan': 'Taşınır Eşya Ödüncü Sözleşmesi',
      'movable-rental': 'Taşınır Kiralama Sözleşmesi',
      'neighbor-complaint-letter': 'Rahatsızlıkla İlgili Komşuya Mektup',
      'security-deposit-refund': 'Güvence Bedeli İade Talebi',
      'visa-invitation-letter': 'Vize Başvurusu Davet Mektubu',
      'address-change-notification': 'Adres Değişikliği Bildirimi',
      'long-term-vehicle-rental': 'Uzun Dönem Araç Kiralama Sözleşmesi',
      'storage-agreement': 'Saklama Sözleşmesi',
      'household-service-agreement': 'Ev İşleri İçin Hizmet Sözleşmesi',
      'bank-account-closure': 'Banka Hesabını Kapatma Dilekçesi',
      'pool-maintenance-agreement': 'Havuz Bakımına İlişkin Sözleşme',
      'vehicle-sale-promise': 'Araç Satış Vaadi Sözleşmesi',
      'diploma-request': 'Diploma Talebi Dilekçesi',
      'grade-objection-primary-secondary': 'İlköğretim ve Ortaöğretim Not İtiraz Dilekçesi',
      'credit-card-closure': 'Kredi Kartı Kapatma Dilekçesi',
      'name-change-request': 'İsim Değişikliği Talep Dilekçesi',
      'university-grade-objection': 'Üniversite Not İtiraz Dilekçesi',
      'green-passport-cadre-request': 'Yeşil Pasaport İçin Kadro Derecesi Gösterir Belge Talebi',
      'surname-change-notification': 'Soyadı Değişikliği Bildirimi',
      'high-school-grade-objection': 'Lise Not İtiraz Dilekçesi',
      'guardianship-appointment': 'Vasi Atanması Dilekçesi',
      'excuse-exam-petition': 'Mazeret Sınav Dilekçesi',
      'widow-orphan-pension-request': 'Dul/Yetim Aylığı Bağlanması İçin Talep Dilekçesi',
      'judicial-control-objection': 'Adli Kontrol Kararına İtiraz Dilekçesi',
      'detention-objection': 'Tutukluluğa İtiraz Dilekçesi',
      'eviction-need-lawsuit': 'Konutun İhtiyaç Sebebiyle Tahliyesine İlişkin Dava Dilekçesi',
      'foreclosure-objection': 'Haciz Takibine İtiraz Dilekçesi',
      'enforcement-objection': 'İlamlı İcra Takibine İtiraz Dilekçesi',
      'alimony-reduction-lawsuit': 'Nafakanın Azaltılması veya Kaldırılması İçin Dava Dilekçesi',
      'alimony-increase-lawsuit': 'Nafakanın Artırılması Dava Dilekçesi',
      'alimony-nonpayment-complaint': 'Boşanma Sonrasında Nafakanın Ödenmemesine İlişkin Şikayet Dilekçesi',
      'insolvency-certificate-request': 'Aciz Belgesi Verilmesi Talebi',
      'disable-auto-billing': 'Otomatik Faturalandırmayı Devre Dışı Bırakma Mektubu',
      'line-cancellation': 'Hat İptal Dilekçesi',
      'invoice-objection': 'Fatura İtiraz Dilekçesi',
      'subscription-cancellation': 'Abonelik İptal Dilekçesi',
      // İş ve istihdam
      'defense-letter': 'Savunma Yazısı',
      'flexible-work-request': 'İşçinin Esnek Çalışma Talebi Dilekçesi',
      'caregiver-service-contract': 'Bakıcı ve Yardımcı Hizmetli İş Sözleşmesi',
      'retirement-request': 'Emeklilik Talebi Dilekçesi',
      'dismissal-reason-request': 'İşten Çıkarılma Nedenini Öğrenme Talebi Mektubu',
      'job-offer-response': 'İş Teklifi Kabul veya Ret Mektubu',
      'salary-increase-request': 'Maaş Artırımı Talebi',
      'unjust-termination-compensation-lawsuit': 'İş Sözleşmesinin Haksız Feshi Halinde Tazminat Talebi Dava Dilekçesi',
      'justified-termination-receivables-lawsuit': 'İş Sözleşmesinin İşçi Tarafından Haklı Nedenle Feshi Halinde Alacak Davası Dilekçesi',
      'resignation-letter': 'İstifa Mektubu',
      // İzin talebi
      'post-birth-partial-work-request': 'Doğum Sonrası Kısmi Çalışma Talebi Mektubu',
      'adoption-unpaid-leave-request': 'Evlat Edinme Sonrası Ücretsiz İzin Talebi Dilekçesi',
      'employee-unpaid-leave-request': 'Çalışanın İşverenden Ücretsiz İzin Talebi Dilekçesi',
      'paternity-leave-request': 'Babalık İzni Dilekçesi',
      'maternity-leave-request': 'Analık (Doğum) İzni Dilekçesi',
      'annual-paid-leave-request': 'Senelik Ücretli İzin Dilekçesi',
      'post-birth-six-month-unpaid-leave': 'Doğum Sonrası Altı Aylık Ücretsiz İzin Talebi Dilekçesi',
      'post-birth-half-day-unpaid-leave': 'Doğum Sonrası Yarım Gün Ücretsiz İzin Talebi Mektubu',
    };
    return types[type] || type;
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Hukuki belgeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && contracts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Hata</h3>
          <p className="text-red-700">{error}</p>
          <p className="text-red-600 text-sm mt-2">
            Eğer bu hata devam ederse, terminal'de şu komutu çalıştırın:
            <code className="block mt-1 bg-red-100 p-2 rounded">npx prisma migrate dev</code>
          </p>
        </div>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchContracts();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

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
    { type: 'housing-transfer', label: 'Konut Devir Protokolü', route: 'olustur' },
    { type: 'sublease-approval', label: 'Alt Kira Onay', route: 'olustur' },
    { type: 'eviction-petition', label: 'Tahliye Dava Dilekçesi', route: 'olustur' },
    { type: 'rent-determination', label: 'Kira Tespit Dava Dilekçesi', route: 'olustur' },
    { type: 'eviction-notice', label: 'Tahliye İhtarname', route: 'olustur' },
    { type: 'rent-increase-notice', label: 'Kira Artış İhtarname', route: 'olustur' },
    { type: 'rent-receipt', label: 'Kira Ödeme Belgesi', route: 'olustur' },
    { type: 'rent-delay-notice', label: 'Kira Gecikme İhtarname', route: 'olustur' },
    { type: 'deposit-refund', label: 'Depozito İade', route: 'olustur' },
    { type: 'tenant-termination', label: 'Kiracı Fesih Bildirimi', route: 'olustur' },
    { type: 'rent-termination', label: 'Kira Fesih Protokolü', route: 'olustur' },
    { type: 'rent-renewal', label: 'Kira Yenileme', route: 'olustur' },
    { type: 'sublease', label: 'Alt Kira', route: 'olustur' },
    { type: 'rent-increase-objection', label: 'Kira Artış İtiraz', route: 'olustur' },
    { type: 'renovation-request', label: 'Tadilat Talebi', route: 'olustur' },
    { type: 'furnished-housing', label: 'Eşyalı Konut', route: 'olustur' },
    { type: 'construction-agreement', label: 'Kat Karşılığı İnşaat', route: 'olustur' },
    // { type: 'commercial', label: 'İşyeri Kiralama', route: 'olustur' }, // Gizlendi
    { type: 'vehicle', label: 'Araç Kiralama', route: 'olustur' },
    { type: 'warehouse', label: 'Depo Kiralama', route: 'olustur' },
    { type: 'sale', label: 'Satış Sözleşmesi', route: 'olustur' },
    { type: 'service', label: 'Hizmet Sözleşmesi', route: 'olustur' },
    { type: 'partnership', label: 'Ortaklık Sözleşmesi', route: 'olustur' },
    // Yeni eklenen sözleşmeler
    { type: 'parent-consent', label: 'Veli İzin Belgesi', route: 'olustur' },
    { type: 'student-permission', label: 'Öğrenci İzin Dilekçesi', route: 'olustur' },
    { type: 'divorce-agreement', label: 'Anlaşmalı Boşanma Sözleşmesi', route: 'olustur' },
    { type: 'criminal-record-statement', label: 'Sabıka Kaydı Beyanı', route: 'olustur' },
    { type: 'movable-property-loan', label: 'Taşınır Eşya Ödüncü Sözleşmesi', route: 'olustur' },
    { type: 'movable-rental', label: 'Taşınır Kiralama Sözleşmesi', route: 'olustur' },
    { type: 'neighbor-complaint-letter', label: 'Rahatsızlıkla İlgili Komşuya Mektup', route: 'olustur' },
    { type: 'security-deposit-refund', label: 'Güvence Bedeli İade Talebi', route: 'olustur' },
    { type: 'visa-invitation-letter', label: 'Vize Başvurusu Davet Mektubu', route: 'olustur' },
    { type: 'address-change-notification', label: 'Adres Değişikliği Bildirimi', route: 'olustur' },
    { type: 'long-term-vehicle-rental', label: 'Uzun Dönem Araç Kiralama Sözleşmesi', route: 'olustur' },
    { type: 'storage-agreement', label: 'Saklama Sözleşmesi', route: 'olustur' },
    { type: 'household-service-agreement', label: 'Ev İşleri İçin Hizmet Sözleşmesi', route: 'olustur' },
    { type: 'bank-account-closure', label: 'Banka Hesabını Kapatma Dilekçesi', route: 'olustur' },
    { type: 'pool-maintenance-agreement', label: 'Havuz Bakımına İlişkin Sözleşme', route: 'olustur' },
    { type: 'vehicle-sale-promise', label: 'Araç Satış Vaadi Sözleşmesi', route: 'olustur' },
    { type: 'diploma-request', label: 'Diploma Talebi Dilekçesi', route: 'olustur' },
    { type: 'grade-objection-primary-secondary', label: 'İlköğretim ve Ortaöğretim Not İtiraz Dilekçesi', route: 'olustur' },
    { type: 'credit-card-closure', label: 'Kredi Kartı Kapatma Dilekçesi', route: 'olustur' },
    { type: 'name-change-request', label: 'İsim Değişikliği Talep Dilekçesi', route: 'olustur' },
    { type: 'university-grade-objection', label: 'Üniversite Not İtiraz Dilekçesi', route: 'olustur' },
    { type: 'green-passport-cadre-request', label: 'Yeşil Pasaport İçin Kadro Derecesi Gösterir Belge Talebi', route: 'olustur' },
    { type: 'surname-change-notification', label: 'Soyadı Değişikliği Bildirimi', route: 'olustur' },
    { type: 'high-school-grade-objection', label: 'Lise Not İtiraz Dilekçesi', route: 'olustur' },
    { type: 'guardianship-appointment', label: 'Vasi Atanması Dilekçesi', route: 'olustur' },
    { type: 'excuse-exam-petition', label: 'Mazeret Sınav Dilekçesi', route: 'olustur' },
    { type: 'widow-orphan-pension-request', label: 'Dul/Yetim Aylığı Bağlanması İçin Talep Dilekçesi', route: 'olustur' },
    { type: 'judicial-control-objection', label: 'Adli Kontrol Kararına İtiraz Dilekçesi', route: 'olustur' },
    { type: 'detention-objection', label: 'Tutukluluğa İtiraz Dilekçesi', route: 'olustur' },
    { type: 'eviction-need-lawsuit', label: 'Konutun İhtiyaç Sebebiyle Tahliyesine İlişkin Dava Dilekçesi', route: 'olustur' },
    { type: 'foreclosure-objection', label: 'Haciz Takibine İtiraz Dilekçesi', route: 'olustur' },
    { type: 'enforcement-objection', label: 'İlamlı İcra Takibine İtiraz Dilekçesi', route: 'olustur' },
    { type: 'alimony-reduction-lawsuit', label: 'Nafakanın Azaltılması veya Kaldırılması İçin Dava Dilekçesi', route: 'olustur' },
    { type: 'alimony-increase-lawsuit', label: 'Nafakanın Artırılması Dava Dilekçesi', route: 'olustur' },
    { type: 'alimony-nonpayment-complaint', label: 'Boşanma Sonrasında Nafakanın Ödenmemesine İlişkin Şikayet Dilekçesi', route: 'olustur' },
    { type: 'insolvency-certificate-request', label: 'Aciz Belgesi Verilmesi Talebi', route: 'olustur' },
    { type: 'disable-auto-billing', label: 'Otomatik Faturalandırmayı Devre Dışı Bırakma Mektubu', route: 'olustur' },
    { type: 'line-cancellation', label: 'Hat İptal Dilekçesi', route: 'olustur' },
    { type: 'invoice-objection', label: 'Fatura İtiraz Dilekçesi', route: 'olustur' },
    { type: 'subscription-cancellation', label: 'Abonelik İptal Dilekçesi', route: 'olustur' },
     // İş ve istihdam
     { type: 'defense-letter', label: 'Savunma Yazısı', route: 'olustur' },
     { type: 'flexible-work-request', label: 'İşçinin Esnek Çalışma Talebi Dilekçesi', route: 'olustur' },
     { type: 'caregiver-service-contract', label: 'Bakıcı ve Yardımcı Hizmetli İş Sözleşmesi', route: 'olustur' },
     { type: 'retirement-request', label: 'Emeklilik Talebi Dilekçesi', route: 'olustur' },
     { type: 'dismissal-reason-request', label: 'İşten Çıkarılma Nedenini Öğrenme Talebi Mektubu', route: 'olustur' },
     { type: 'job-offer-response', label: 'İş Teklifi Kabul veya Ret Mektubu', route: 'olustur' },
     { type: 'salary-increase-request', label: 'Maaş Artırımı Talebi', route: 'olustur' },
     { type: 'unjust-termination-compensation-lawsuit', label: 'İş Sözleşmesinin Haksız Feshi Halinde Tazminat Talebi Dava Dilekçesi', route: 'olustur' },
     { type: 'justified-termination-receivables-lawsuit', label: 'İş Sözleşmesinin İşçi Tarafından Haklı Nedenle Feshi Halinde Alacak Davası Dilekçesi', route: 'olustur' },
     { type: 'resignation-letter', label: 'İstifa Mektubu', route: 'olustur' },
     // İzin talebi
     { type: 'post-birth-partial-work-request', label: 'Doğum Sonrası Kısmi Çalışma Talebi Mektubu', route: 'olustur' },
     { type: 'adoption-unpaid-leave-request', label: 'Evlat Edinme Sonrası Ücretsiz İzin Talebi Dilekçesi', route: 'olustur' },
     { type: 'employee-unpaid-leave-request', label: 'Çalışanın İşverenden Ücretsiz İzin Talebi Dilekçesi', route: 'olustur' },
     { type: 'paternity-leave-request', label: 'Babalık İzni Dilekçesi', route: 'olustur' },
     { type: 'maternity-leave-request', label: 'Analık (Doğum) İzni Dilekçesi', route: 'olustur' },
     { type: 'annual-paid-leave-request', label: 'Senelik Ücretli İzin Dilekçesi', route: 'olustur' },
     { type: 'post-birth-six-month-unpaid-leave', label: 'Doğum Sonrası Altı Aylık Ücretsiz İzin Talebi Dilekçesi', route: 'olustur' },
     { type: 'post-birth-half-day-unpaid-leave', label: 'Doğum Sonrası Yarım Gün Ücretsiz İzin Talebi Mektubu', route: 'olustur' },
   ];


  return (
    <div className="space-y-6">
      {/* Hata Mesajı - Eğer varsa göster ama sayfayı engelleme */}
      {error && (
        <div className={`border rounded-lg p-4 ${contracts.length > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className={`font-semibold mb-2 ${contracts.length > 0 ? 'text-yellow-800' : 'text-red-800'}`}>
            {contracts.length > 0 ? 'Uyarı' : 'Hata'}
          </h3>
          <p className={`text-sm ${contracts.length > 0 ? 'text-yellow-700' : 'text-red-700'}`}>
            {error}
          </p>
          {(error.includes('DATABASE_URL') || error.includes('connection') || error.includes('connect')) && (
            <p className="text-xs mt-2 text-gray-600">
              💡 Veritabanı bağlantısı yapılandırılmamış olabilir. .env dosyasında DATABASE_URL kontrol edin.
            </p>
          )}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hukuki Belgeler ve Dilekçe</h1>
            <p className="mt-2 text-gray-600">Hukuki belgeleri ve dilekçeleri yönetin ve düzenleyin</p>
          </div>
          <Link
            href="/admin/sozlesmeler/yeni"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
                  Yeni Dilekçe
          </Link>
        </div>
        
        {/* Hukuki Belge Butonları - Tüm Template Tipleri */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mevcut Hukuki Belge Şablonları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* Ev Kiralama - Özel sayfa */}
            <Link
              href="/admin/sozlesmeler/ev-kiralama"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Ev Kiralama Sözleşmesi</span>
            </Link>
            
            {/* Tüm template tipleri */}
            {templateTypes.map((templateInfo) => {
              const contract = contracts.find(c => c.type === templateInfo.type);
              const turkishSlug = createTurkishSlug(templateInfo.label);
              return (
                <Link
                  key={templateInfo.type}
                  href={`/admin/sozlesmeler/${turkishSlug}`}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{templateInfo.label}</span>
                  {contract && (
                    <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded">
                      ✓
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Arama - Gizlendi */}
      {/* <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Hukuki belge ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div> */}

      {/* Hukuki Belgeler Listesi - Gizlendi */}
      {/* <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Versiyon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zorunlu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz hukuki belge yok'}
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{contract.title}</div>
                          <div className="text-sm text-gray-500">{contract.language.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {getTypeLabel(contract.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      v{contract.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(contract.id, contract.isActive)}
                        className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          contract.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {contract.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Pasif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contract.isRequired ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Zorunlu
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Opsiyonel
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contract.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/sozlesmeler/${contract.id}/olustur`}
                          className="text-green-600 hover:text-green-900"
                          title="Oluştur"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/sozlesmeler/${contract.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/sozlesmeler/${contract.id}/duzenle`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(contract.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  );
}

