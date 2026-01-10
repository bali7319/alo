'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, FileText, Printer } from 'lucide-react';
import { contractTemplates } from '@/lib/contract-templates';

interface Contract {
  id: string;
  title: string;
  type: string;
  content: string;
  version: string;
  isActive: boolean;
  isRequired: boolean;
  language: string;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Türkçe slug oluşturma fonksiyonu (page.tsx ile aynı)
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

// Template tipleri ve label'ları (page.tsx ile aynı)
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

// Backward compatibility için eski slug'ları da ekle
Object.assign(turkishSlugToType, {
  'ev-kiralama-sozlesmesi': 'ev-kiralama',
  'ev-kiralama': 'ev-kiralama',
  'konut-devir-protokolu': 'housing-transfer',
  'alt-kira-onay': 'sublease-approval',
  'tahliye-dava-dilekcesi': 'eviction-petition',
  'kira-tespit-dava-dilekcesi': 'rent-determination',
  'tahliye-ihtarname': 'eviction-notice',
  'kira-artis-ihtarname': 'rent-increase-notice',
  'kira-odeme-belgesi': 'rent-receipt',
  'kira-gecikme-ihtarname': 'rent-delay-notice',
  'depozito-iade': 'deposit-refund',
  'kiraci-fesih-bildirimi': 'tenant-termination',
  'kira-fesih-protokolu': 'rent-termination',
  'kira-yenileme': 'rent-renewal',
  'alt-kira': 'sublease',
  'kira-artis-itiraz': 'rent-increase-objection', // Eski format
  'tadilat-talebi': 'renovation-request',
  'esyali-konut': 'furnished-housing',
  'kat-karsiligi-insaat': 'construction-agreement',
  'arac-kiralama': 'vehicle',
  'depo-kiralama': 'warehouse',
  'satis-sozlesmesi': 'sale',
  'hizmet-sozlesmesi': 'service',
  'ortaklik-sozlesmesi': 'partnership',
  'veli-izin-belgesi': 'parent-consent',
  'ogrenci-izin-dilekcesi': 'student-permission',
  'anlasmali-bosanma-sozlesmesi': 'divorce-agreement',
  'sabika-kaydi-beyani': 'criminal-record-statement',
  'tasinir-esya-oduncu-sozlesmesi': 'movable-property-loan',
  'tasinir-kiralama-sozlesmesi': 'movable-rental',
  'rahatsizlikla-ilgili-komsuya-mektup': 'neighbor-complaint-letter',
  'guvence-bedeli-iade-talebi': 'security-deposit-refund',
  'vize-basvurusu-davet-mektubu': 'visa-invitation-letter',
  'adres-degisikligi-bildirimi': 'address-change-notification',
  'uzun-donem-arac-kiralama-sozlesmesi': 'long-term-vehicle-rental',
  'saklama-sozlesmesi': 'storage-agreement',
  'ev-isleri-icin-hizmet-sozlesmesi': 'household-service-agreement',
  'banka-hesabini-kapatma-dilekcesi': 'bank-account-closure',
  'havuz-bakimina-iliskin-sozlesme': 'pool-maintenance-agreement',
  'arac-satis-vaadi-sozlesmesi': 'vehicle-sale-promise',
  'diploma-talebi-dilekcesi': 'diploma-request',
  'ilkogretim-ve-ortaogretim-not-itiraz-dilekcesi': 'grade-objection-primary-secondary',
  'kredi-karti-kapatma-dilekcesi': 'credit-card-closure',
  'isim-degisikligi-talep-dilekcesi': 'name-change-request',
  'universite-not-itiraz-dilekcesi': 'university-grade-objection',
  'yesil-pasaport-icin-kadro-derecesi-gosterir-belge-talebi': 'green-passport-cadre-request',
  'soyadi-degisikligi-bildirimi': 'surname-change-notification',
  'lise-not-itiraz-dilekcesi': 'high-school-grade-objection',
  'vasi-atanmasi-dilekcesi': 'guardianship-appointment',
  'mazeret-sinav-dilekcesi': 'excuse-exam-petition',
  'dul-yetim-ayligi-baglanmasi-icin-talep-dilekcesi': 'widow-orphan-pension-request',
  'adli-kontrol-kararina-itiraz-dilekcesi': 'judicial-control-objection',
  'tutukluluga-itiraz-dilekcesi': 'detention-objection',
  'konutun-ihtiyac-sebebiyle-tahliyesine-iliskin-dava-dilekcesi': 'eviction-need-lawsuit',
  'haciz-takibine-itiraz-dilekcesi': 'foreclosure-objection',
  'ilamli-icra-takibine-itiraz-dilekcesi': 'enforcement-objection',
  'nafakanin-azaltilmasi-veya-kaldirilmasi-icin-dava-dilekcesi': 'alimony-reduction-lawsuit',
  'nafakanin-artirilmasi-dava-dilekcesi': 'alimony-increase-lawsuit',
  'bosanma-sonrasinda-nafakanin-odenmemesine-iliskin-sikayet-dilekcesi': 'alimony-nonpayment-complaint',
  'aciz-belgesi-verilmesi-talebi': 'insolvency-certificate-request',
  'otomatik-faturalandirmayi-devre-disi-birakma-mektubu': 'disable-auto-billing',
  'hat-iptal-dilekcesi': 'line-cancellation',
  'fatura-itiraz-dilekcesi': 'invoice-objection',
  'abonelik-iptal-dilekcesi': 'subscription-cancellation',
  'savunma-yazisi': 'defense-letter',
  'iscinin-esnek-calisma-talebi-dilekcesi': 'flexible-work-request',
  'bakici-ve-yardimci-hizmetli-is-sozlesmesi': 'caregiver-service-contract',
  'emeklilik-talebi-dilekcesi': 'retirement-request',
  'isten-cikarilma-nedenini-ogrenme-talebi-mektubu': 'dismissal-reason-request',
  'is-teklifi-kabul-veya-ret-mektubu': 'job-offer-response',
  'maas-artirimi-talebi': 'salary-increase-request',
  'is-sozlesmesinin-haksiz-feshi-halinde-tazminat-talebi-dava-dilekcesi': 'unjust-termination-compensation-lawsuit',
  'is-sozlesmesinin-isci-tarafindan-hakli-nedenle-feshi-halinde-alacak-davasi-dilekcesi': 'justified-termination-receivables-lawsuit',
  'istifa-mektubu': 'resignation-letter',
  'dogum-sonrasi-kismi-calisma-talebi-mektubu': 'post-birth-partial-work-request',
  'evlat-edinme-sonrasi-ucretsiz-izin-talebi-dilekcesi': 'adoption-unpaid-leave-request',
  'calisanin-isverenden-ucretsiz-izin-talebi-dilekcesi': 'employee-unpaid-leave-request',
  'babalik-izni-dilekcesi': 'paternity-leave-request',
  'analik-dogum-izni-dilekcesi': 'maternity-leave-request',
  'senelik-ucretli-izin-dilekcesi': 'annual-paid-leave-request',
  'dogum-sonrasi-alti-aylik-ucretsiz-izin-talebi-dilekcesi': 'post-birth-six-month-unpaid-leave',
  'dogum-sonrasi-yarim-gun-ucretsiz-izin-talebi-mektubu': 'post-birth-half-day-unpaid-leave',
});

// Template tiplerinin Türkçe label'larını bulmak için
const getTemplateLabel = (type: string): string => {
  const templateLabels: { [key: string]: string } = {
    'ev-kiralama': 'Ev Kiralama Sözleşmesi',
    'housing-transfer': 'Konut Devir Protokolü',
    'sublease-approval': 'Alt Kira Onay',
    'eviction-petition': 'Tahliye Dava Dilekçesi',
    'rent-determination': 'Kira Tespit Dava Dilekçesi',
    'eviction-notice': 'Tahliye İhtarname',
    'rent-increase-notice': 'Kira Artış İhtarname',
    'rent-receipt': 'Kira Ödeme Belgesi',
    'rent-delay-notice': 'Kira Gecikme İhtarname',
    'deposit-refund': 'Depozito İade',
    'tenant-termination': 'Kiracı Fesih Bildirimi',
    'rent-termination': 'Kira Fesih Protokolü',
    'rent-renewal': 'Kira Yenileme',
    'sublease': 'Alt Kira',
    'rent-increase-objection': 'Kira Artış İtiraz',
    'renovation-request': 'Tadilat Talebi',
    'furnished-housing': 'Eşyalı Konut',
    'construction-agreement': 'Kat Karşılığı İnşaat',
    'vehicle': 'Araç Kiralama',
    'warehouse': 'Depo Kiralama',
    'sale': 'Satış Sözleşmesi',
    'service': 'Hizmet Sözleşmesi',
    'partnership': 'Ortaklık Sözleşmesi',
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
    'post-birth-partial-work-request': 'Doğum Sonrası Kısmi Çalışma Talebi Mektubu',
    'adoption-unpaid-leave-request': 'Evlat Edinme Sonrası Ücretsiz İzin Talebi Dilekçesi',
    'employee-unpaid-leave-request': 'Çalışanın İşverenden Ücretsiz İzin Talebi Dilekçesi',
    'paternity-leave-request': 'Babalık İzni Dilekçesi',
    'maternity-leave-request': 'Analık (Doğum) İzni Dilekçesi',
    'annual-paid-leave-request': 'Senelik Ücretli İzin Dilekçesi',
    'post-birth-six-month-unpaid-leave': 'Doğum Sonrası Altı Aylık Ücretsiz İzin Talebi Dilekçesi',
    'post-birth-half-day-unpaid-leave': 'Doğum Sonrası Yarım Gün Ücretsiz İzin Talebi Mektubu',
  };
  
  return templateLabels[type] || type;
};

export default function SozlesmeDetayPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Türkçe slug'dan İngilizce type'a çevir (backward compatibility için)
  const actualType = turkishSlugToType[contractId] || contractId;

  // Template type kontrolü
  const isTemplateType = contractTemplates[actualType] || actualType === 'ev-kiralama';
  const template = contractTemplates[actualType];

  useEffect(() => {
    if (status === 'loading') return;

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      router.push(`/giris?callbackUrl=${encodeURIComponent(`/admin/sozlesmeler/${contractId}`)}`);
      return;
    }

    // Ev-kiralama özel sayfaya yönlendir
    if (actualType === 'ev-kiralama') {
      router.push('/admin/sozlesmeler/ev-kiralama');
      return;
    }

    // Template type ise form verilerini yükle
    if (isTemplateType && template) {
      const defaultData = template.getDefaultFormData();
      setFormData(defaultData);
      setLoading(false);
      return;
    }

    // Contract ID olarak işle
    fetchContract();
  }, [session, status, router, contractId, actualType, isTemplateType, template]);

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/admin/contracts/${contractId}`);
      if (!response.ok) {
        throw new Error('Sözleşme yüklenemedi');
      }
      const data = await response.json();
      setContract(data);
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
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'user': 'Kullanıcı Sözleşmesi',
      'seller': 'Satıcı Sözleşmesi',
      'buyer': 'Alıcı Sözleşmesi',
      'premium': 'Premium Üyelik',
      'general': 'Genel Şartlar',
      'privacy': 'Gizlilik Politikası',
      'terms': 'Kullanım Şartları',
    };
    return types[type] || type;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Template type ise template sayfasını render et
  if (isTemplateType && template) {
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
                  <h1 className="text-2xl font-bold text-gray-900">{getTemplateLabel(actualType)}</h1>
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
              <div className="bg-white rounded-lg shadow p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {template.getFormFields(formData, handleInputChange)}
              </div>
            </div>

            {/* Sağ Taraf - Ön İzleme */}
            <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-100px)] lg:col-span-1 print:w-full">
              <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:p-0 print:w-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
                <div className="print:w-full preview-container" style={{
                  transform: 'scale(0.65)',
                  transformOrigin: 'top center',
                  width: '153.85%',
                  marginLeft: '-26.92%'
                }}>
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

  // Contract detay sayfası
  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 mb-2">Sözleşme bulunamadı</p>
            <Link href="/admin/sozlesmeler" className="text-blue-600 hover:underline">
              Geri dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/sozlesmeler"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
            <p className="mt-2 text-gray-600">
              {getTypeLabel(contract.type)} • v{contract.version} • {contract.language.toUpperCase()}
            </p>
          </div>
        </div>
        <Link
          href={`/admin/sozlesmeler/${contractId}/duzenle`}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="h-5 w-5 mr-2" />
          Düzenle
        </Link>
      </div>

      {/* Bilgiler */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Durum</p>
            <p className="text-sm font-medium text-gray-900">
              {contract.isActive ? (
                <span className="text-green-600">Aktif</span>
              ) : (
                <span className="text-gray-600">Pasif</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Zorunlu</p>
            <p className="text-sm font-medium text-gray-900">
              {contract.isRequired ? (
                <span className="text-red-600">Evet</span>
              ) : (
                <span className="text-gray-600">Hayır</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Oluşturulma</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(contract.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Güncelleme</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(contract.updatedAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
        {contract.expiresAt && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">Son Geçerlilik</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(contract.expiresAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">Sözleşme İçeriği</h2>
        </div>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: contract.content }}
        />
      </div>
    </div>
  );
}
