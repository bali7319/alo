const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const additionalContracts = [
  // Aile, evlilik, boşanma, birliktelik
  {
    title: 'Veli İzin Belgesi',
    type: 'parent-consent',
    content: '<p>Veli İzin Belgesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Öğrenci İzin Dilekçesi',
    type: 'student-permission',
    content: '<p>Öğrenci İzin Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Anlaşmalı Boşanma Sözleşmesi',
    type: 'divorce-agreement',
    content: '<p>Anlaşmalı Boşanma Sözleşmesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  
  // Günlük hayat
  {
    title: 'Sabıka Kaydı Beyanı',
    type: 'criminal-record-statement',
    content: '<p>Sabıka Kaydı Beyanı içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Taşınır Eşya Ödüncü Sözleşmesi',
    type: 'movable-property-loan',
    content: '<p>Taşınır Eşya Ödüncü Sözleşmesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Taşınır Kiralama Sözleşmesi',
    type: 'movable-rental',
    content: '<p>Taşınır Kiralama Sözleşmesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Rahatsızlıkla İlgili Komşuya Mektup',
    type: 'neighbor-complaint-letter',
    content: '<p>Rahatsızlıkla İlgili Komşuya Mektup içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Güvence Bedeli İade Talebi',
    type: 'security-deposit-refund',
    content: '<p>Güvence Bedeli İade Talebi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Vize Başvurusu Davet Mektubu',
    type: 'visa-invitation-letter',
    content: '<p>Vize Başvurusu Davet Mektubu içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Adres Değişikliği Bildirimi',
    type: 'address-change-notification',
    content: '<p>Adres Değişikliği Bildirimi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Uzun Dönem Araç Kiralama Sözleşmesi',
    type: 'long-term-vehicle-rental',
    content: '<p>Uzun Dönem Araç Kiralama Sözleşmesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Saklama Sözleşmesi',
    type: 'storage-agreement',
    content: '<p>Saklama Sözleşmesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Ev İşleri İçin Hizmet Sözleşmesi',
    type: 'household-service-agreement',
    content: '<p>Ev İşleri İçin Hizmet Sözleşmesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Banka Hesabını Kapatma Dilekçesi',
    type: 'bank-account-closure',
    content: '<p>Banka Hesabını Kapatma Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Havuz Bakımına İlişkin Sözleşme',
    type: 'pool-maintenance-agreement',
    content: '<p>Havuz Bakımına İlişkin Sözleşme içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Araç Satış Vaadi Sözleşmesi',
    type: 'vehicle-sale-promise',
    content: '<p>Araç Satış Vaadi Sözleşmesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Diploma Talebi Dilekçesi',
    type: 'diploma-request',
    content: '<p>Diploma Talebi Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'İlköğretim ve Ortaöğretim Not İtiraz Dilekçesi',
    type: 'grade-objection-primary-secondary',
    content: '<p>İlköğretim ve Ortaöğretim Not İtiraz Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Kredi Kartı Kapatma Dilekçesi',
    type: 'credit-card-closure',
    content: '<p>Kredi Kartı Kapatma Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'İsim Değişikliği Talep Dilekçesi',
    type: 'name-change-request',
    content: '<p>İsim Değişikliği Talep Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  
  // Resmi yazışmalar
  {
    title: 'Üniversite Not İtiraz Dilekçesi',
    type: 'university-grade-objection',
    content: '<p>Üniversite Not İtiraz Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Yeşil Pasaport İçin Kadro Derecesi Gösterir Belge Talebi',
    type: 'green-passport-cadre-request',
    content: '<p>Yeşil Pasaport İçin Kadro Derecesi Gösterir Belge Talebi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Soyadı Değişikliği Bildirimi',
    type: 'surname-change-notification',
    content: '<p>Soyadı Değişikliği Bildirimi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Lise Not İtiraz Dilekçesi',
    type: 'high-school-grade-objection',
    content: '<p>Lise Not İtiraz Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Vasi Atanması Dilekçesi',
    type: 'guardianship-appointment',
    content: '<p>Vasi Atanması Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Mazeret Sınav Dilekçesi',
    type: 'excuse-exam-petition',
    content: '<p>Mazeret Sınav Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Dul/Yetim Aylığı Bağlanması İçin Talep Dilekçesi',
    type: 'widow-orphan-pension-request',
    content: '<p>Dul/Yetim Aylığı Bağlanması İçin Talep Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  
  // Hukuki işlemler
  {
    title: 'Adli Kontrol Kararına İtiraz Dilekçesi',
    type: 'judicial-control-objection',
    content: '<p>Adli Kontrol Kararına İtiraz Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Tutukluluğa İtiraz Dilekçesi',
    type: 'detention-objection',
    content: '<p>Tutukluluğa İtiraz Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Haciz Takibine İtiraz Dilekçesi',
    type: 'foreclosure-objection',
    content: '<p>Haciz Takibine İtiraz Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'İlamlı İcra Takibine İtiraz Dilekçesi',
    type: 'enforcement-objection',
    content: '<p>İlamlı İcra Takibine İtiraz Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Nafakanın Azaltılması veya Kaldırılması İçin Dava Dilekçesi',
    type: 'alimony-reduction-lawsuit',
    content: '<p>Nafakanın Azaltılması veya Kaldırılması İçin Dava Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Nafakanın Artırılması Dava Dilekçesi',
    type: 'alimony-increase-lawsuit',
    content: '<p>Nafakanın Artırılması Dava Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Boşanma Sonrasında Nafakanın Ödenmemesine İlişkin Şikayet Dilekçesi',
    type: 'alimony-nonpayment-complaint',
    content: '<p>Boşanma Sonrasında Nafakanın Ödenmemesine İlişkin Şikayet Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Aciz Belgesi Verilmesi Talebi',
    type: 'insolvency-certificate-request',
    content: '<p>Aciz Belgesi Verilmesi Talebi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  
  // Tüketim
  {
    title: 'Otomatik Faturalandırmayı Devre Dışı Bırakma Mektubu',
    type: 'disable-auto-billing',
    content: '<p>Otomatik Faturalandırmayı Devre Dışı Bırakma Mektubu içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Hat İptal Dilekçesi',
    type: 'line-cancellation',
    content: '<p>Hat İptal Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Fatura İtiraz Dilekçesi',
    type: 'invoice-objection',
    content: '<p>Fatura İtiraz Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Abonelik İptal Dilekçesi',
    type: 'subscription-cancellation',
    content: '<p>Abonelik İptal Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Aylık Malın Değişimi/Onarımı/İadesi İçin İhtarname',
    type: 'monthly-goods-notice',
    content: '<p>Aylık Malın Değişimi/Onarımı/İadesi İçin İhtarname içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  
  // Kurumlar
  {
    title: 'Dernek Organlarındaki Değişiklik Bildirimi',
    type: 'association-organ-change',
    content: '<p>Dernek Organlarındaki Değişiklik Bildirimi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Dernek Yerleşim Yeri Değişikliği Bildirimi',
    type: 'association-address-change',
    content: '<p>Dernek Yerleşim Yeri Değişikliği Bildirimi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Dernek Genel Kurulunu Toplantıya Çağrı',
    type: 'association-general-assembly-call',
    content: '<p>Dernek Genel Kurulunu Toplantıya Çağrı içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Dernek Tüzüğü',
    type: 'association-bylaws',
    content: '<p>Dernek Tüzüğü içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
];

async function createAdditionalContracts() {
  try {
    console.log('Ek sözleşmeler oluşturuluyor...');
    
    for (const contract of additionalContracts) {
      const existing = await prisma.contract.findFirst({
        where: {
          type: contract.type,
        },
      });

      if (existing) {
        console.log(`✓ ${contract.title} zaten mevcut, atlanıyor...`);
        continue;
      }

      await prisma.contract.create({
        data: contract,
      });
      console.log(`✓ ${contract.title} oluşturuldu`);
    }

    console.log('\nTüm ek sözleşmeler başarıyla oluşturuldu!');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdditionalContracts();

