const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const workContracts = [
  // İş ve istihdam
  {
    title: 'Savunma Yazısı',
    type: 'defense-letter',
    content: '<p>Savunma Yazısı içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'İşçinin Esnek Çalışma Talebi Dilekçesi',
    type: 'flexible-work-request',
    content: '<p>İşçinin Esnek Çalışma Talebi Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Bakıcı ve Yardımcı Hizmetli İş Sözleşmesi',
    type: 'caregiver-service-contract',
    content: '<p>Bakıcı ve Yardımcı Hizmetli İş Sözleşmesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Emeklilik Talebi Dilekçesi',
    type: 'retirement-request',
    content: '<p>Emeklilik Talebi Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'İşten Çıkarılma Nedenini Öğrenme Talebi Mektubu',
    type: 'dismissal-reason-request',
    content: '<p>İşten Çıkarılma Nedenini Öğrenme Talebi Mektubu içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'İş Teklifi Kabul veya Ret Mektubu',
    type: 'job-offer-response',
    content: '<p>İş Teklifi Kabul veya Ret Mektubu içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Maaş Artırımı Talebi',
    type: 'salary-increase-request',
    content: '<p>Maaş Artırımı Talebi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'İş Sözleşmesinin Haksız Feshi Halinde Tazminat Talebi Dava Dilekçesi',
    type: 'unjust-termination-compensation-lawsuit',
    content: '<p>İş Sözleşmesinin Haksız Feshi Halinde Tazminat Talebi Dava Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'İş Sözleşmesinin İşçi Tarafından Haklı Nedenle Feshi Halinde Alacak Davası Dilekçesi',
    type: 'justified-termination-receivables-lawsuit',
    content: '<p>İş Sözleşmesinin İşçi Tarafından Haklı Nedenle Feshi Halinde Alacak Davası Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'İstifa Mektubu',
    type: 'resignation-letter',
    content: '<p>İstifa Mektubu içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  
  // İzin talebi
  {
    title: 'Doğum Sonrası Kısmi Çalışma Talebi Mektubu',
    type: 'post-birth-partial-work-request',
    content: '<p>Doğum Sonrası Kısmi Çalışma Talebi Mektubu içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Evlat Edinme Sonrası Ücretsiz İzin Talebi Dilekçesi',
    type: 'adoption-unpaid-leave-request',
    content: '<p>Evlat Edinme Sonrası Ücretsiz İzin Talebi Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Çalışanın İşverenden Ücretsiz İzin Talebi Dilekçesi',
    type: 'employee-unpaid-leave-request',
    content: '<p>Çalışanın İşverenden Ücretsiz İzin Talebi Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Babalık İzni Dilekçesi',
    type: 'paternity-leave-request',
    content: '<p>Babalık İzni Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Analık (Doğum) İzni Dilekçesi',
    type: 'maternity-leave-request',
    content: '<p>Analık (Doğum) İzni Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Senelik Ücretli İzin Dilekçesi',
    type: 'annual-paid-leave-request',
    content: '<p>Senelik Ücretli İzin Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Doğum Sonrası Altı Aylık Ücretsiz İzin Talebi Dilekçesi',
    type: 'post-birth-six-month-unpaid-leave',
    content: '<p>Doğum Sonrası Altı Aylık Ücretsiz İzin Talebi Dilekçesi içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
  {
    title: 'Doğum Sonrası Yarım Gün Ücretsiz İzin Talebi Mektubu',
    type: 'post-birth-half-day-unpaid-leave',
    content: '<p>Doğum Sonrası Yarım Gün Ücretsiz İzin Talebi Mektubu içeriği...</p>',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
  },
];

async function createWorkContracts() {
  try {
    console.log('İş ve izin sözleşmeleri oluşturuluyor...');
    
    for (const contract of workContracts) {
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

    console.log('\nTüm iş ve izin sözleşmeleri başarıyla oluşturuldu!');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWorkContracts();

