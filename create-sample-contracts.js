const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleContracts = [
  {
    title: 'İşyeri Kiralama Sözleşmesi',
    type: 'commercial',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>İŞYERİ KİRALAMA SÖZLEŞMESİ</h1>

<h2>1. TARAFLAR</h2>
<p><strong>KİRAYA VEREN:</strong> [Ad Soyad/Ünvan]<br>
TC Kimlik No/Vergi No: [TC/Vergi No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]<br>
E-posta: [E-posta]</p>

<p><strong>KİRACI:</strong> [Ad Soyad/Ünvan]<br>
TC Kimlik No/Vergi No: [TC/Vergi No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]<br>
E-posta: [E-posta]</p>

<h2>2. KİRALANAN İŞYERİ</h2>
<p><strong>Adres:</strong> [Tam Adres]<br>
<strong>Daire No:</strong> [Daire No]<br>
<strong>Metrekare:</strong> [m²]<br>
<strong>Kullanım Amacı:</strong> Ticari faaliyet</p>

<h2>3. KİRA BEDELİ VE ÖDEME</h2>
<p><strong>Aylık Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Ödeme Şekli:</strong> Banka havalesi/EFT<br>
<strong>Ödeme Günü:</strong> Her ayın [Gün]'ü<br>
<strong>Depozito:</strong> [Tutar] ₺</p>

<h2>4. KİRA SÜRESİ</h2>
<p><strong>Başlangıç Tarihi:</strong> [Tarih]<br>
<strong>Bitiş Tarihi:</strong> [Tarih]<br>
<strong>Süre:</strong> [Ay/Yıl]</p>

<h2>5. YÜKÜMLÜLÜKLER</h2>
<h3>Kiralayanın Yükümlülükleri:</h3>
<ul>
  <li>İşyerini kullanıma hazır halde teslim etmek</li>
  <li>Yapısal onarımları yapmak</li>
  <li>Kiracının huzurlu kullanımını sağlamak</li>
</ul>

<h3>Kiracının Yükümlülükleri:</h3>
<ul>
  <li>Kira bedelini zamanında ödemek</li>
  <li>İşyerini özenle kullanmak</li>
  <li>Elektrik, su, doğalgaz gibi faturaları ödemek</li>
  <li>İşyerini sözleşme sonunda boş ve temiz teslim etmek</li>
</ul>

<h2>6. ÖZEL ŞARTLAR</h2>
<ul>
  <li>Kiracı, işyerini üçüncü kişilere devredemez veya alt kiraya veremez.</li>
  <li>Kira bedeli her yıl TÜFE oranında artırılacaktır.</li>
  <li>Kiracı, işyerinde yapacağı değişiklikler için kiralayandan yazılı izin almak zorundadır.</li>
  <li>İşyeri sadece ticari amaçla kullanılacaktır.</li>
</ul>

<h2>7. TAHLİYE</h2>
<p>Kiracı, sözleşme sonunda işyerini boş ve temiz olarak teslim etmeyi taahhüt eder. Tahliye sırasında yapılan değişiklikler eski haline getirilecektir.</p>

<h2>8. İHTİLAF ÇÖZÜMÜ</h2>
<p>İhtilaf halinde [Şehir] Mahkemeleri ve İcra Daireleri yetkilidir.</p>

<h2>9. DİĞER HÜKÜMLER</h2>
<p>Bu sözleşme [Tarih] tarihinde [Şehir]'de düzenlenmiş olup, iki nüsha halinde taraflarca imzalanmıştır.</p>

<div style="margin-top: 50px;">
  <div style="display: flex; justify-content: space-between;">
    <div>
      <p><strong>KİRAYA VEREN</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
    <div>
      <p><strong>KİRACI</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
  </div>
</div>`
  },
  {
    title: 'Araç Kiralama Sözleşmesi',
    type: 'vehicle',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>ARAÇ KİRALAMA SÖZLEŞMESİ</h1>

<h2>1. TARAFLAR</h2>
<p><strong>KİRAYA VEREN (Araç Sahibi):</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]<br>
E-posta: [E-posta]</p>

<p><strong>KİRACI:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]<br>
E-posta: [E-posta]<br>
Ehliyet No: [Ehliyet No]</p>

<h2>2. KİRALANAN ARAÇ BİLGİLERİ</h2>
<p><strong>Marka:</strong> [Marka]<br>
<strong>Model:</strong> [Model]<br>
<strong>Yıl:</strong> [Yıl]<br>
<strong>Plaka:</strong> [Plaka]<br>
<strong>Şasi No:</strong> [Şasi No]<br>
<strong>Motor No:</strong> [Motor No]<br>
<strong>Renk:</strong> [Renk]<br>
<strong>Kilometre:</strong> [Km]</p>

<h2>3. KİRA BEDELİ VE ÖDEME</h2>
<p><strong>Günlük Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Haftalık Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Aylık Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Ödeme Şekli:</strong> Nakit/Banka<br>
<strong>Depozito:</strong> [Tutar] ₺</p>

<h2>4. KİRA SÜRESİ</h2>
<p><strong>Başlangıç Tarihi:</strong> [Tarih]<br>
<strong>Bitiş Tarihi:</strong> [Tarih]<br>
<strong>Toplam Süre:</strong> [Gün/Ay]</p>

<h2>5. KULLANIM ŞARTLARI</h2>
<ul>
  <li>Araç sadece kiracı tarafından kullanılacaktır.</li>
  <li>Araç, trafik kurallarına uygun şekilde kullanılacaktır.</li>
  <li>Alkollü araç kullanımı kesinlikle yasaktır.</li>
  <li>Araç, ticari amaçla kullanılamaz.</li>
  <li>Araç, yurt dışına çıkarılamaz.</li>
</ul>

<h2>6. SİGORTA VE HASAR</h2>
<ul>
  <li>Araç, kasko sigortası ile korunmaktadır.</li>
  <li>Kaza durumunda derhal kiralayana haber verilecektir.</li>
  <li>Kiracının kusurundan kaynaklanan hasarlar kiracıya aittir.</li>
  <li>Sigorta kapsamı dışındaki hasarlar kiracı tarafından karşılanacaktır.</li>
</ul>

<h2>7. BAKIM VE ONARIM</h2>
<ul>
  <li>Rutin bakımlar kiralayana aittir.</li>
  <li>Kiracının kusurundan kaynaklanan onarımlar kiracıya aittir.</li>
  <li>Araç, belirlenen kilometre sınırını aşarsa ek ücret alınacaktır.</li>
</ul>

<h2>8. YÜKÜMLÜLÜKLER</h2>
<h3>Kiralayanın Yükümlülükleri:</h3>
<ul>
  <li>Aracı çalışır durumda teslim etmek</li>
  <li>Gerekli belgeleri (ruhsat, sigorta vb.) sağlamak</li>
  <li>Rutin bakımları yaptırmak</li>
</ul>

<h3>Kiracının Yükümlülükleri:</h3>
<ul>
  <li>Kira bedelini zamanında ödemek</li>
  <li>Aracı özenle kullanmak</li>
  <li>Yakıt masraflarını karşılamak</li>
  <li>Otopark ve trafik cezalarını ödemek</li>
  <li>Aracı sözleşme sonunda temiz ve hasarsız teslim etmek</li>
</ul>

<h2>9. SÖZLEŞME FESHİ</h2>
<p>Taraflardan biri, sözleşmeyi [Gün] gün önceden yazılı bildirimle feshedebilir. Fesih durumunda depozito iade edilecektir.</p>

<h2>10. İHTİLAF ÇÖZÜMÜ</h2>
<p>İhtilaf halinde [Şehir] Mahkemeleri ve İcra Daireleri yetkilidir.</p>

<div style="margin-top: 50px;">
  <div style="display: flex; justify-content: space-between;">
    <div>
      <p><strong>KİRAYA VEREN</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
    <div>
      <p><strong>KİRACI</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
  </div>
</div>`
  },
  {
    title: 'Depo Kiralama Sözleşmesi',
    type: 'warehouse',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>DEPO KİRALAMA SÖZLEŞMESİ</h1>

<h2>1. TARAFLAR</h2>
<p><strong>KİRAYA VEREN:</strong> [Ad Soyad/Ünvan]<br>
TC Kimlik No/Vergi No: [TC/Vergi No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]</p>

<p><strong>KİRACI:</strong> [Ad Soyad/Ünvan]<br>
TC Kimlik No/Vergi No: [TC/Vergi No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]</p>

<h2>2. KİRALANAN DEPO</h2>
<p><strong>Adres:</strong> [Tam Adres]<br>
<strong>Depo No:</strong> [Depo No]<br>
<strong>Metrekare:</strong> [m²]<br>
<strong>Özellikler:</strong> [Özellikler]</p>

<h2>3. KİRA BEDELİ</h2>
<p><strong>Aylık Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Ödeme Günü:</strong> Her ayın [Gün]'ü<br>
<strong>Depozito:</strong> [Tutar] ₺</p>

<h2>4. KULLANIM AMACI</h2>
<p>Depo, sadece eşya depolama amacıyla kullanılacaktır. Tehlikeli madde, yanıcı malzeme veya yasal olmayan eşyalar depolanamaz.</p>

<h2>5. YÜKÜMLÜLÜKLER</h2>
<h3>Kiralayanın Yükümlülükleri:</h3>
<ul>
  <li>Depoyu kullanıma hazır halde teslim etmek</li>
  <li>Güvenlik önlemlerini almak</li>
  <li>Yapısal onarımları yapmak</li>
</ul>

<h3>Kiracının Yükümlülükleri:</h3>
<ul>
  <li>Kira bedelini zamanında ödemek</li>
  <li>Depoyu temiz ve düzenli tutmak</li>
  <li>Güvenlik kurallarına uymak</li>
  <li>Depolanan eşyaların güvenliğinden sorumlu olmak</li>
</ul>

<h2>6. SİGORTA</h2>
<p>Kiracı, depolanan eşyalar için sigorta yaptırmakla yükümlüdür. Kiralayan, depo binası için sigorta yaptırmıştır.</p>

<h2>7. TAHLİYE</h2>
<p>Kiracı, sözleşme sonunda depoyu boş ve temiz olarak teslim etmeyi taahhüt eder.</p>

<h2>8. İHTİLAF ÇÖZÜMÜ</h2>
<p>İhtilaf halinde [Şehir] Mahkemeleri yetkilidir.</p>

<div style="margin-top: 50px;">
  <div style="display: flex; justify-content: space-between;">
    <div>
      <p><strong>KİRAYA VEREN</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
    <div>
      <p><strong>KİRACI</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
  </div>
</div>`
  },
  {
    title: 'Satış Sözleşmesi',
    type: 'sale',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>SATIŞ SÖZLEŞMESİ</h1>

<h2>1. TARAFLAR</h2>
<p><strong>SATICI:</strong> [Ad Soyad/Ünvan]<br>
TC Kimlik No/Vergi No: [TC/Vergi No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]</p>

<p><strong>ALICI:</strong> [Ad Soyad/Ünvan]<br>
TC Kimlik No/Vergi No: [TC/Vergi No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]</p>

<h2>2. SATILAN MAL/HİZMET</h2>
<p><strong>Mal/Hizmet Adı:</strong> [Açıklama]<br>
<strong>Miktar:</strong> [Miktar]<br>
<strong>Birim Fiyat:</strong> [Tutar] ₺<br>
<strong>Toplam Tutar:</strong> [Tutar] ₺<br>
<strong>KDV Oranı:</strong> %[Oran]<br>
<strong>KDV Tutarı:</strong> [Tutar] ₺<br>
<strong>Genel Toplam:</strong> [Tutar] ₺</p>

<h2>3. ÖDEME ŞARTLARI</h2>
<p><strong>Ödeme Şekli:</strong> [Nakit/Çek/Senet/Banka Havalesi]<br>
<strong>Ödeme Tarihi:</strong> [Tarih]<br>
<strong>Peşinat:</strong> [Tutar] ₺<br>
<strong>Kalan Tutar:</strong> [Tutar] ₺</p>

<h2>4. TESLİMAT</h2>
<p><strong>Teslimat Yeri:</strong> [Adres]<br>
<strong>Teslimat Tarihi:</strong> [Tarih]<br>
<strong>Teslimat Şekli:</strong> [Kargo/Kendi Aracıyla/Alıcı Alacak]</p>

<h2>5. GARANTİ VE SORUMLULUK</h2>
<ul>
  <li>Satılan mal/hizmet, belirtilen özelliklere uygun olacaktır.</li>
  <li>Garanti süresi: [Süre]</li>
  <li>Garanti kapsamı: [Açıklama]</li>
  <li>Garanti dışı durumlar: [Açıklama]</li>
</ul>

<h2>6. CAYMA HAKKI</h2>
<p>Alıcı, [Gün] gün içinde cayma hakkını kullanabilir. Cayma durumunda mal/hizmet iade edilecek ve ödeme geri verilecektir.</p>

<h2>7. UYUŞMAZLIK ÇÖZÜMÜ</h2>
<p>Uyuşmazlık halinde [Şehir] Mahkemeleri yetkilidir.</p>

<h2>8. DİĞER HÜKÜMLER</h2>
<p>Bu sözleşme [Tarih] tarihinde [Şehir]'de düzenlenmiş olup, iki nüsha halinde taraflarca imzalanmıştır.</p>

<div style="margin-top: 50px;">
  <div style="display: flex; justify-content: space-between;">
    <div>
      <p><strong>SATICI</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
    <div>
      <p><strong>ALICI</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
  </div>
</div>`
  },
  {
    title: 'Hizmet Sözleşmesi',
    type: 'service',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>HİZMET SÖZLEŞMESİ</h1>

<h2>1. TARAFLAR</h2>
<p><strong>HİZMET VEREN:</strong> [Ad Soyad/Ünvan]<br>
TC Kimlik No/Vergi No: [TC/Vergi No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]</p>

<p><strong>HİZMET ALAN:</strong> [Ad Soyad/Ünvan]<br>
TC Kimlik No/Vergi No: [TC/Vergi No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]</p>

<h2>2. HİZMET KONUSU</h2>
<p><strong>Hizmet Türü:</strong> [Hizmet Açıklaması]<br>
<strong>Hizmet Kapsamı:</strong> [Detaylı Açıklama]<br>
<strong>Başlangıç Tarihi:</strong> [Tarih]<br>
<strong>Bitiş Tarihi:</strong> [Tarih]<br>
<strong>Süre:</strong> [Süre]</p>

<h2>3. ÜCRET VE ÖDEME</h2>
<p><strong>Toplam Ücret:</strong> [Tutar] ₺<br>
<strong>Ödeme Şekli:</strong> [Nakit/Banka Havalesi/Çek]<br>
<strong>Ödeme Planı:</strong> [Peşin/Taksitli]<br>
<strong>Vade:</strong> [Tarih]</p>

<h2>4. TARAFLARIN YÜKÜMLÜLÜKLERİ</h2>
<h3>Hizmet Verenin Yükümlülükleri:</h3>
<ul>
  <li>Hizmeti belirtilen süre ve kalitede sunmak</li>
  <li>Gerekli malzeme ve ekipmanı sağlamak</li>
  <li>İş güvenliği kurallarına uymak</li>
  <li>Hizmet süresince sigorta yaptırmak</li>
</ul>

<h3>Hizmet Alanın Yükümlülükleri:</h3>
<ul>
  <li>Ücreti zamanında ödemek</li>
  <li>Gerekli izin ve belgeleri sağlamak</li>
  <li>Çalışma ortamını hazırlamak</li>
  <li>Hizmet verenin çalışmasına engel olmamak</li>
</ul>

<h2>5. KALİTE VE DENETİM</h2>
<ul>
  <li>Hizmet, belirlenen standartlara uygun olacaktır.</li>
  <li>Hizmet alan, hizmeti denetleme hakkına sahiptir.</li>
  <li>Eksik veya hatalı hizmet durumunda düzeltme yapılacaktır.</li>
</ul>

<h2>6. SÖZLEŞME FESHİ</h2>
<p>Taraflardan biri, [Gün] gün önceden yazılı bildirimle sözleşmeyi feshedebilir. Fesih durumunda yapılan işler için ödeme yapılacaktır.</p>

<h2>7. GİZLİLİK</h2>
<p>Taraflar, sözleşme süresince edindikleri bilgileri üçüncü kişilerle paylaşmayacaktır.</p>

<h2>8. UYUŞMAZLIK ÇÖZÜMÜ</h2>
<p>Uyuşmazlık halinde [Şehir] Mahkemeleri yetkilidir.</p>

<div style="margin-top: 50px;">
  <div style="display: flex; justify-content: space-between;">
    <div>
      <p><strong>HİZMET VEREN</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
    <div>
      <p><strong>HİZMET ALAN</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
  </div>
</div>`
  },
  {
    title: 'Ortaklık Sözleşmesi',
    type: 'partnership',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>ORTAKLIK SÖZLEŞMESİ</h1>

<h2>1. ORTAKLAR</h2>
<p><strong>1. ORTAK:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]</p>

<p><strong>2. ORTAK:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]</p>

<h2>2. ORTAKLIĞIN KONUSU</h2>
<p><strong>Ortaklık Konusu:</strong> [İş Açıklaması]<br>
<strong>Faaliyet Alanı:</strong> [Sektör]<br>
<strong>Başlangıç Tarihi:</strong> [Tarih]</p>

<h2>3. SERMAYE PAYLARI</h2>
<p><strong>1. Ortak Sermayesi:</strong> [Tutar] ₺ (%[Oran])<br>
<strong>2. Ortak Sermayesi:</strong> [Tutar] ₺ (%[Oran])<br>
<strong>Toplam Sermaye:</strong> [Tutar] ₺</p>

<h2>4. KAR-ZARAR DAĞILIMI</h2>
<p>Kar ve zarar, ortakların sermaye paylarına göre dağıtılacaktır.</p>
<ul>
  <li>1. Ortak: %[Oran]</li>
  <li>2. Ortak: %[Oran]</li>
</ul>

<h2>5. YÖNETİM VE KARAR ALMA</h2>
<ul>
  <li>Ortaklık, ortakların birlikte yönetimi ile yürütülecektir.</li>
  <li>Önemli kararlar, ortakların oybirliği ile alınacaktır.</li>
  <li>Günlük işler, yetkili ortak tarafından yürütülecektir.</li>
</ul>

<h2>6. ORTAKLARIN YÜKÜMLÜLÜKLERİ</h2>
<ul>
  <li>Sermaye paylarını zamanında ödemek</li>
  <li>Ortaklık menfaatlerini korumak</li>
  <li>Gizlilik ilkesine uymak</li>
  <li>Rekabet yasağına uymak</li>
</ul>

<h2>7. ORTAKLIKTAN ÇIKIŞ</h2>
<p>Ortak, [Gün] gün önceden yazılı bildirimle ortaklıktan çıkabilir. Çıkış durumunda sermaye payı iade edilecektir.</p>

<h2>8. SÖZLEŞME SÜRESİ</h2>
<p>Bu ortaklık sözleşmesi [Süre] süreyle geçerlidir. Süre sonunda taraflar yeniden değerlendirme yapabilir.</p>

<h2>9. UYUŞMAZLIK ÇÖZÜMÜ</h2>
<p>Uyuşmazlık halinde [Şehir] Mahkemeleri yetkilidir.</p>

<div style="margin-top: 50px;">
  <div style="display: flex; justify-content: space-between;">
    <div>
      <p><strong>1. ORTAK</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
    <div>
      <p><strong>2. ORTAK</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
  </div>
</div>`
  }
];

async function createSampleContracts() {
  try {
    console.log('Dilekçe örnekleri oluşturuluyor...\n');

    for (const contract of sampleContracts) {
      // Mevcut sözleşmeyi kontrol et
      const existing = await prisma.contract.findFirst({
        where: {
          title: contract.title,
          type: contract.type,
        },
      });

      if (existing) {
        console.log(`✓ "${contract.title}" zaten mevcut, güncelleniyor...`);
        await prisma.contract.update({
          where: { id: existing.id },
          data: {
            ...contract,
            publishedAt: contract.isActive ? new Date() : null,
          },
        });
      } else {
        console.log(`✓ "${contract.title}" oluşturuluyor...`);
        await prisma.contract.create({
          data: {
            ...contract,
            publishedAt: contract.isActive ? new Date() : null,
          },
        });
      }
    }

    console.log('\n✅ Tüm dilekçe örnekleri başarıyla oluşturuldu!');
    console.log('\nOluşturulan sözleşmeler:');
    sampleContracts.forEach((c, i) => {
      console.log(`${i + 1}. ${c.title} (${c.type})`);
    });
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleContracts();

