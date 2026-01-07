const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const housingContracts = [
  {
    title: 'Konut Kira Sözleşmesi Devir Protokolü',
    type: 'housing-transfer',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>KONUT KİRA SÖZLEŞMESİ DEVİR PROTOKOLÜ</h1>

<h2>1. TARAFLAR</h2>
<p><strong>ESKİ KİRACI:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]</p>

<p><strong>YENİ KİRACI:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]<br>
Telefon: [Telefon]</p>

<p><strong>KİRAYA VEREN:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<h2>2. KONUT BİLGİLERİ</h2>
<p><strong>Adres:</strong> [Tam Adres]<br>
<strong>Daire No:</strong> [Daire No]</p>

<h2>3. DEVİR BİLGİLERİ</h2>
<p><strong>Devir Tarihi:</strong> [Tarih]<br>
<strong>Eski Kira Sözleşmesi Tarihi:</strong> [Tarih]<br>
<strong>Aylık Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Depozito:</strong> [Tutar] ₺</p>

<h2>4. DEVİR ŞARTLARI</h2>
<ul>
  <li>Eski kiracı, konutu boş ve temiz olarak yeni kiracıya teslim edecektir.</li>
  <li>Depozito, eski kiracıdan yeni kiracıya devredilecektir.</li>
  <li>Eski kiracının borçları (kira, faturalar vb.) kapatılacaktır.</li>
  <li>Yeni kiracı, eski kira sözleşmesinin şartlarını kabul eder.</li>
</ul>

<h2>5. TARAFLARIN YÜKÜMLÜLÜKLERİ</h2>
<p><strong>Eski Kiracı:</strong> Konutu boş, temiz ve hasarsız teslim etmekle yükümlüdür.</p>
<p><strong>Yeni Kiracı:</strong> Konutu teslim almak ve kira sözleşmesi şartlarını kabul etmekle yükümlüdür.</p>
<p><strong>Kiraya Veren:</strong> Devir işlemini onaylamakla yükümlüdür.</p>

<h2>6. DİĞER HÜKÜMLER</h2>
<p>Bu protokol [Tarih] tarihinde düzenlenmiş olup, üç nüsha halinde taraflarca imzalanmıştır.</p>

<div style="margin-top: 50px;">
  <div style="display: flex; justify-content: space-between;">
    <div>
      <p><strong>ESKİ KİRACI</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
    <div>
      <p><strong>YENİ KİRACI</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
    <div>
      <p><strong>KİRAYA VEREN</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
  </div>
</div>`
  },
  {
    title: 'Ev Sahibinin Alt Kira Sözleşmesini Onay Mektubu',
    type: 'sublease-approval',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>ALT KİRA SÖZLEŞMESİNİ ONAY MEKTUBU</h1>

<p><strong>Sayın [Alt Kiracı Adı],</strong></p>

<p>[Tarih] tarihinde [Kiracı Adı] ile yapmış olduğunuz alt kira sözleşmesini inceledim.</p>

<p>Konut adresi: [Tam Adres]</p>
<p>Alt kira bedeli: [Tutar] ₺</p>
<p>Alt kira süresi: [Başlangıç Tarihi] - [Bitiş Tarihi]</p>

<h2>ONAY</h2>
<p>Yukarıda belirtilen alt kira sözleşmesini onaylıyorum. Ancak aşağıdaki şartlara uyulması gerekmektedir:</p>

<ul>
  <li>Ana kira sözleşmesinin şartlarına uyulacaktır.</li>
  <li>Kira bedeli zamanında ödenecektir.</li>
  <li>Konut özenle kullanılacaktır.</li>
  <li>Ana kira sözleşmesi sona erdiğinde alt kira sözleşmesi de sona erecektir.</li>
</ul>

<p>Saygılarımla,</p>

<div style="margin-top: 50px;">
  <p><strong>[Ev Sahibi Adı]</strong></p>
  <p>TC Kimlik No: [TC No]</p>
  <p>İmza: _______________</p>
  <p>Tarih: [Tarih]</p>
</div>`
  },
  {
    title: 'Eşyalı Konut Kira Sözleşmesi',
    type: 'furnished-housing',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>EŞYALI KONUT KİRA SÖZLEŞMESİ</h1>

<h2>1. TARAFLAR</h2>
<p><strong>KİRAYA VEREN:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<p><strong>KİRACI:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<h2>2. KONUT BİLGİLERİ</h2>
<p><strong>Adres:</strong> [Tam Adres]<br>
<strong>Daire No:</strong> [Daire No]<br>
<strong>Oda Sayısı:</strong> [Sayı]</p>

<h2>3. EŞYA LİSTESİ</h2>
<p>Konut ile birlikte teslim edilen eşyalar:</p>
<ul>
  <li>[Eşya 1] - [Adet] adet</li>
  <li>[Eşya 2] - [Adet] adet</li>
  <li>[Eşya 3] - [Adet] adet</li>
  <li>...</li>
</ul>

<h2>4. KİRA BEDELİ</h2>
<p><strong>Aylık Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Eşya Kullanım Bedeli:</strong> [Tutar] ₺<br>
<strong>Toplam Aylık Bedel:</strong> [Tutar] ₺<br>
<strong>Depozito:</strong> [Tutar] ₺</p>

<h2>5. EŞYA KULLANIM ŞARTLARI</h2>
<ul>
  <li>Eşyalar özenle kullanılacaktır.</li>
  <li>Eşyalarda meydana gelen hasarlar kiracıya aittir.</li>
  <li>Eşyaların bakım ve onarımı kiracıya aittir.</li>
  <li>Eşyalar sözleşme sonunda eksiksiz teslim edilecektir.</li>
</ul>

<h2>6. HASAR VE SORUMLULUK</h2>
<p>Eşyalarda meydana gelen hasar, aşınma ve yıpranma durumunda kiracı sorumludur. Hasar durumunda tamir veya değiştirme masrafları kiracıya aittir.</p>

<h2>7. TAHLİYE</h2>
<p>Kiracı, sözleşme sonunda konutu ve eşyaları eksiksiz, temiz ve hasarsız olarak teslim etmeyi taahhüt eder.</p>

<h2>8. DİĞER HÜKÜMLER</h2>
<p>Bu sözleşme [Tarih] tarihinde düzenlenmiş olup, iki nüsha halinde taraflarca imzalanmıştır.</p>

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
    title: 'Konutun İhtiyaç Sebebiyle Tahliyesine İlişkin Dava Dilekçesi',
    type: 'eviction-petition',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>KONUTUN İHTİYAÇ SEBEBİYLE TAHLİYESİNE İLİŞKİN DAVA DİLEKÇESİ</h1>

<p><strong>[Şehir] [İlçe] ASLİYE HUKUK MAHKEMESİ'NE</strong></p>

<h2>DAVACI</h2>
<p><strong>Adı Soyadı:</strong> [Ad Soyad]<br>
<strong>TC Kimlik No:</strong> [TC No]<br>
<strong>Adres:</strong> [Adres]<br>
<strong>Vekil:</strong> [Vekil Adı] (Avukat)</p>

<h2>DAVALI</h2>
<p><strong>Adı Soyadı:</strong> [Ad Soyad]<br>
<strong>TC Kimlik No:</strong> [TC No]<br>
<strong>Adres:</strong> [Adres]</p>

<h2>DAVA KONUSU</h2>
<p>Kiracı olarak kullanılan konutun, ihtiyaç sebebiyle tahliyesine ve teslimine karar verilmesi talebidir.</p>

<h2>OLAY</h2>
<p>1. Davacı, [Adres] adresindeki konutun maliki olup, bu konut [Tarih] tarihinden itibaren davalıya kiralanmıştır.</p>
<p>2. Davacı, aşağıdaki sebeplerle konuta ihtiyaç duymaktadır:</p>
<ul>
  <li>[İhtiyaç Sebebi 1]</li>
  <li>[İhtiyaç Sebebi 2]</li>
  <li>[İhtiyaç Sebebi 3]</li>
</ul>
<p>3. Davacı, davalıya [Tarih] tarihinde ihtarname göndererek konutun tahliyesini talep etmiştir.</p>
<p>4. Davalı, konutu tahliye etmemiştir.</p>

<h2>HUKUKİ SEBEPLER</h2>
<p>6098 sayılı Türk Borçlar Kanunu'nun 350. maddesi uyarınca, kiralayanın kendisi, eşi, çocukları veya bakmakla yükümlü olduğu kişiler için konuta ihtiyacı varsa, kira sözleşmesini feshedebilir.</p>

<h2>DELİLLER</h2>
<ul>
  <li>Tapu kaydı</li>
  <li>Kira sözleşmesi</li>
  <li>İhtarname</li>
  <li>Tanık beyanları</li>
  <li>Diğer belgeler</li>
</ul>

<h2>SONUÇ VE İSTEM</h2>
<p>Yukarıda açıklanan sebeplerle;</p>
<ol>
  <li>Davalının [Adres] adresindeki konutu tahliye etmesine,</li>
  <li>Konutun davacıya teslim edilmesine,</li>
  <li>Davalıdan tahliye giderlerinin alınmasına,</li>
  <li>Yargılama giderlerinin davalıya yükletilmesine</li>
</ol>
<p>karar verilmesini saygılarımla arz ederim.</p>

<div style="margin-top: 50px;">
  <p><strong>Davacı Vekili</strong></p>
  <p>[Avukat Adı]</p>
  <p>İmza: _______________</p>
  <p>Tarih: [Tarih]</p>
</div>`
  },
  {
    title: 'Kira Bedelinin Tespitine İlişkin Dava Dilekçesi',
    type: 'rent-determination',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>KİRA BEDELİNİN TESPİTİNE İLİŞKİN DAVA DİLEKÇESİ</h1>

<p><strong>[Şehir] [İlçe] ASLİYE HUKUK MAHKEMESİ'NE</strong></p>

<h2>DAVACI</h2>
<p><strong>Adı Soyadı:</strong> [Ad Soyad]<br>
<strong>TC Kimlik No:</strong> [TC No]<br>
<strong>Adres:</strong> [Adres]</p>

<h2>DAVALI</h2>
<p><strong>Adı Soyadı:</strong> [Ad Soyad]<br>
<strong>TC Kimlik No:</strong> [TC No]<br>
<strong>Adres:</strong> [Adres]</p>

<h2>DAVA KONUSU</h2>
<p>Kira bedelinin tespitine karar verilmesi talebidir.</p>

<h2>OLAY</h2>
<p>1. Davacı, [Adres] adresindeki konutun maliki olup, bu konut davalıya kiralanmıştır.</p>
<p>2. Mevcut kira bedeli [Tutar] ₺ olup, bu bedel piyasa koşullarına uygun değildir.</p>
<p>3. Taraflar arasında kira bedeli konusunda anlaşmazlık bulunmaktadır.</p>
<p>4. Davacı, kira bedelinin [Tutar] ₺ olarak tespit edilmesini talep etmektedir.</p>

<h2>HUKUKİ SEBEPLER</h2>
<p>6098 sayılı Türk Borçlar Kanunu'nun 340. maddesi uyarınca, kira bedeli taraflarca belirlenemezse, mahkeme tarafından tespit edilir.</p>

<h2>DELİLLER</h2>
<ul>
  <li>Tapu kaydı</li>
  <li>Kira sözleşmesi</li>
  <li>Emlak değerleme raporu</li>
  <li>Piyasa araştırması</li>
  <li>Tanık beyanları</li>
</ul>

<h2>SONUÇ VE İSTEM</h2>
<p>Yukarıda açıklanan sebeplerle;</p>
<ol>
  <li>[Adres] adresindeki konutun aylık kira bedelinin [Tutar] ₺ olarak tespit edilmesine,</li>
  <li>Yargılama giderlerinin davalıya yükletilmesine</li>
</ol>
<p>karar verilmesini saygılarımla arz ederim.</p>

<div style="margin-top: 50px;">
  <p><strong>Davacı</strong></p>
  <p>İmza: _______________</p>
  <p>Tarih: [Tarih]</p>
</div>`
  },
  {
    title: 'Kat Karşılığı Bina Yapım Sözleşmesi',
    type: 'construction-agreement',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>KAT KARŞILIĞI BİNA YAPIM SÖZLEŞMESİ</h1>

<h2>1. TARAFLAR</h2>
<p><strong>ARSA SAHİBİ:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<p><strong>MÜTEAHHİT:</strong> [Ad Soyad/Ünvan]<br>
TC Kimlik No/Vergi No: [TC/Vergi No]<br>
Adres: [Adres]</p>

<h2>2. ARSA BİLGİLERİ</h2>
<p><strong>Ada:</strong> [Ada No]<br>
<strong>Parsel:</strong> [Parsel No]<br>
<strong>Yüzölçümü:</strong> [m²]<br>
<strong>Adres:</strong> [Tam Adres]</p>

<h2>3. YAPILACAK BİNA</h2>
<p><strong>Kat Sayısı:</strong> [Sayı]<br>
<strong>Daire Sayısı:</strong> [Sayı]<br>
<strong>Toplam İnşaat Alanı:</strong> [m²]<br>
<strong>İnşaat Süresi:</strong> [Ay] ay</p>

<h2>4. DAĞILIM</h2>
<p><strong>Arsa Sahibine Verilecek:</strong><br>
- [Daire 1] - [m²] m²<br>
- [Daire 2] - [m²] m²<br>
<strong>Toplam:</strong> [m²] m²</p>

<p><strong>Müteahhite Kalacak:</strong><br>
- [Daire 3] - [m²] m²<br>
- [Daire 4] - [m²] m²<br>
<strong>Toplam:</strong> [m²] m²</p>

<h2>5. YÜKÜMLÜLÜKLER</h2>
<h3>Arsa Sahibinin Yükümlülükleri:</h3>
<ul>
  <li>Arsayı müteahhite teslim etmek</li>
  <li>İnşaat ruhsatı almak</li>
  <li>Gerekli belgeleri sağlamak</li>
</ul>

<h3>Müteahhitin Yükümlülükleri:</h3>
<ul>
  <li>Binanın inşaatını yapmak</li>
  <li>İnşaatı belirlenen sürede tamamlamak</li>
  <li>İnşaatı standartlara uygun yapmak</li>
  <li>Arsa sahibine belirlenen daireleri teslim etmek</li>
</ul>

<h2>6. ÖDEME PLANI</h2>
<ul>
  <li>Temel atma: [Tutar] ₺</li>
  <li>Kaba inşaat: [Tutar] ₺</li>
  <li>İnşaat tamamlama: [Tutar] ₺</li>
</ul>

<h2>7. GARANTİ</h2>
<p>Müteahhit, inşaatın 10 yıl süreyle garanti altında olduğunu taahhüt eder.</p>

<h2>8. UYUŞMAZLIK ÇÖZÜMÜ</h2>
<p>Uyuşmazlık halinde [Şehir] Mahkemeleri yetkilidir.</p>

<div style="margin-top: 50px;">
  <div style="display: flex; justify-content: space-between;">
    <div>
      <p><strong>ARSA SAHİBİ</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
    <div>
      <p><strong>MÜTEAHHİT</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
  </div>
</div>`
  },
  {
    title: 'Haksız Kira Artıran Ev Sahibine İtiraz Mektubu',
    type: 'rent-increase-objection',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>HAKSIZ KİRA ARTIŞINA İTİRAZ MEKTUBU</h1>

<p><strong>Sayın [Ev Sahibi Adı],</strong></p>

<p>[Tarih] tarihinde göndermiş olduğunuz kira artışı bildirimi aldım.</p>

<p><strong>Konut Adresi:</strong> [Tam Adres]</p>
<p><strong>Mevcut Kira Bedeli:</strong> [Tutar] ₺</p>
<p><strong>Önerilen Yeni Kira Bedeli:</strong> [Tutar] ₺</p>
<p><strong>Artış Oranı:</strong> %[Oran]</p>

<h2>İTİRAZ GEREKÇELERİ</h2>
<p>Yukarıda belirtilen kira artışına aşağıdaki sebeplerle itiraz ediyorum:</p>

<ol>
  <li><strong>Yasal Sınır Aşımı:</strong> Önerilen artış oranı, yasal sınırları aşmaktadır. 6098 sayılı Türk Borçlar Kanunu'nun 344. maddesi uyarınca, kira artışı TÜFE oranını aşamaz.</li>
  
  <li><strong>Piyasa Değeri:</strong> Önerilen kira bedeli, bölgedeki benzer konutların kira bedellerinden yüksektir.</li>
  
  <li><strong>Konutun Durumu:</strong> Konutun mevcut durumu, önerilen artışı haklı kılmamaktadır.</li>
  
  <li><strong>Ekonomik Koşullar:</strong> Mevcut ekonomik koşullar, bu kadar yüksek bir artışı kaldırmamaktadır.</li>
</ul>

<h2>ÖNERİM</h2>
<p>Kira bedelinin [Tutar] ₺ olarak belirlenmesini öneriyorum. Bu bedel, hem yasal sınırlar içinde hem de piyasa koşullarına uygundur.</p>

<h2>SONUÇ</h2>
<p>Yukarıda belirtilen sebeplerle, önerilen kira artışını kabul etmiyorum. Kira bedelinin yasal sınırlar içinde ve makul bir oranda artırılmasını talep ediyorum.</p>

<p>Aksi halde, hukuki yollara başvurmak zorunda kalacağımı bildiririm.</p>

<p>Saygılarımla,</p>

<div style="margin-top: 50px;">
  <p><strong>[Kiracı Adı]</strong></p>
  <p>TC Kimlik No: [TC No]</p>
  <p>İmza: _______________</p>
  <p>Tarih: [Tarih]</p>
</div>`
  },
  {
    title: 'Kira Yenileme Sözleşmesi',
    type: 'rent-renewal',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>KİRA YENİLEME SÖZLEŞMESİ</h1>

<h2>1. TARAFLAR</h2>
<p><strong>KİRAYA VEREN:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<p><strong>KİRACI:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<h2>2. ESKİ SÖZLEŞME BİLGİLERİ</h2>
<p><strong>Eski Sözleşme Tarihi:</strong> [Tarih]<br>
<strong>Eski Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Eski Sözleşme Bitiş Tarihi:</strong> [Tarih]</p>

<h2>3. YENİ SÖZLEŞME BİLGİLERİ</h2>
<p><strong>Yeni Sözleşme Tarihi:</strong> [Tarih]<br>
<strong>Yeni Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Yeni Sözleşme Başlangıç Tarihi:</strong> [Tarih]<br>
<strong>Yeni Sözleşme Bitiş Tarihi:</strong> [Tarih]<br>
<strong>Süre:</strong> [Ay/Yıl]</p>

<h2>4. KONUT BİLGİLERİ</h2>
<p><strong>Adres:</strong> [Tam Adres]<br>
<strong>Daire No:</strong> [Daire No]</p>

<h2>5. YENİLEME ŞARTLARI</h2>
<ul>
  <li>Eski sözleşmenin diğer şartları aynen geçerlidir.</li>
  <li>Kira bedeli, yasal sınırlar içinde artırılmıştır.</li>
  <li>Depozito tutarı aynı kalmıştır.</li>
  <li>Taraflar, yeni sözleşme şartlarını kabul etmişlerdir.</li>
</ul>

<h2>6. DİĞER HÜKÜMLER</h2>
<p>Bu yenileme sözleşmesi [Tarih] tarihinde düzenlenmiş olup, iki nüsha halinde taraflarca imzalanmıştır.</p>

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
    title: 'Kiraya Veren Tarafından Kiracının Tahliyesi İçin İhtarname',
    type: 'eviction-notice',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>TAHLİYE İHTARNAMESİ</h1>

<p><strong>Sayın [Kiracı Adı],</strong></p>

<p>TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<h2>KONU: KONUTUN TAHLİYESİ</h2>

<p>Yukarıda kimlik bilgileri yazılı kişi olarak, [Adres] adresindeki konutun kiracısısınız.</p>

<p><strong>Kira Sözleşmesi Tarihi:</strong> [Tarih]<br>
<strong>Mevcut Kira Bedeli:</strong> [Tutar] ₺</p>

<h2>TAHLİYE GEREKÇESİ</h2>
<p>Aşağıdaki sebeplerle konutun tahliyesini talep ediyorum:</p>

<ol>
  <li><strong>Kira Ödememe:</strong> [Tarih] tarihinden itibaren kira bedelini ödemediniz. Toplam borç: [Tutar] ₺</li>
  
  <li><strong>Sözleşme İhlali:</strong> Kira sözleşmesinin [Madde] maddesini ihlal ettiniz.</li>
  
  <li><strong>Konutun Kötü Kullanımı:</strong> Konutu sözleşmeye aykırı şekilde kullandınız.</li>
  
  <li><strong>Diğer:</strong> [Açıklama]</li>
</ol>

<h2>TAHLİYE TALEBİ</h2>
<p>Bu ihtarname ile sizi, yukarıda belirtilen sebeplerle;</p>

<ul>
  <li>Konutu [Tarih] tarihine kadar tahliye etmeniz,</li>
  <li>Konutu boş ve temiz olarak teslim etmeniz,</li>
  <li>Borçlu olduğunuz kira bedelini ödemeniz,</li>
  <li>Depozito iadesi için gerekli işlemleri yapmanız</li>
</ul>

<p>konusunda ihtar ediyorum.</p>

<h2>UYARI</h2>
<p>Belirtilen süre içinde konutu tahliye etmezseniz, hukuki yollara başvurarak tahliye davası açacağım. Bu durumda yargılama giderleri ve avukatlık ücretleri size yükletilecektir.</p>

<p>Saygılarımla,</p>

<div style="margin-top: 50px;">
  <p><strong>[Kiraya Veren Adı]</strong></p>
  <p>TC Kimlik No: [TC No]</p>
  <p>Adres: [Adres]</p>
  <p>İmza: _______________</p>
  <p>Tarih: [Tarih]</p>
</div>

<p><strong>NOT:</strong> Bu ihtarname, noter aracılığıyla veya iadeli taahhütlü posta ile gönderilmiştir.</p>`
  },
  {
    title: 'Alt Kira Anlaşması',
    type: 'sublease',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>ALT KİRA ANLAŞMASI</h1>

<h2>1. TARAFLAR</h2>
<p><strong>ANA KİRACI:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<p><strong>ALT KİRACI:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<h2>2. ANA KİRA SÖZLEŞMESİ BİLGİLERİ</h2>
<p><strong>Kiraya Veren:</strong> [Ad Soyad]<br>
<strong>Ana Kira Sözleşmesi Tarihi:</strong> [Tarih]<br>
<strong>Ana Kira Bedeli:</strong> [Tutar] ₺</p>

<h2>3. ALT KİRA BİLGİLERİ</h2>
<p><strong>Konut Adresi:</strong> [Tam Adres]<br>
<strong>Alt Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Alt Kira Başlangıç Tarihi:</strong> [Tarih]<br>
<strong>Alt Kira Bitiş Tarihi:</strong> [Tarih]<br>
<strong>Süre:</strong> [Ay]</p>

<h2>4. ÖDEME ŞARTLARI</h2>
<p><strong>Ödeme Günü:</strong> Her ayın [Gün]'ü<br>
<strong>Ödeme Şekli:</strong> [Nakit/Banka Havalesi]<br>
<strong>Depozito:</strong> [Tutar] ₺</p>

<h2>5. ÖZEL ŞARTLAR</h2>
<ul>
  <li>Bu alt kira anlaşması, ana kira sözleşmesinin şartlarına tabidir.</li>
  <li>Ana kira sözleşmesi sona erdiğinde, alt kira anlaşması da otomatik olarak sona erecektir.</li>
  <li>Alt kiracı, ana kiraya verenin onayını almıştır.</li>
  <li>Alt kiracı, konutu özenle kullanacaktır.</li>
</ul>

<h2>6. YÜKÜMLÜLÜKLER</h2>
<h3>Ana Kiracının Yükümlülükleri:</h3>
<ul>
  <li>Konutu alt kiracıya teslim etmek</li>
  <li>Ana kira bedelini ödemek</li>
  <li>Alt kiracının huzurlu kullanımını sağlamak</li>
</ul>

<h3>Alt Kiracının Yükümlülükleri:</h3>
<ul>
  <li>Alt kira bedelini zamanında ödemek</li>
  <li>Konutu özenle kullanmak</li>
  <li>Faturaları ödemek</li>
  <li>Konutu sözleşme sonunda temiz teslim etmek</li>
</ul>

<h2>7. DİĞER HÜKÜMLER</h2>
<p>Bu alt kira anlaşması [Tarih] tarihinde düzenlenmiş olup, iki nüsha halinde taraflarca imzalanmıştır.</p>

<div style="margin-top: 50px;">
  <div style="display: flex; justify-content: space-between;">
    <div>
      <p><strong>ANA KİRACI</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
    <div>
      <p><strong>ALT KİRACI</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
    </div>
  </div>
</div>`
  },
  {
    title: 'Kira Bedelinin Artırılması İçin İhtarname',
    type: 'rent-increase-notice',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>KİRA BEDELİNİN ARTIRILMASI İÇİN İHTARNAME</h1>

<p><strong>Sayın [Kiracı Adı],</strong></p>

<p>TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<h2>KONU: KİRA BEDELİNİN ARTIRILMASI</h2>

<p>Yukarıda kimlik bilgileri yazılı kişi olarak, [Adres] adresindeki konutun kiracısısınız.</p>

<p><strong>Mevcut Kira Sözleşmesi Tarihi:</strong> [Tarih]<br>
<strong>Mevcut Aylık Kira Bedeli:</strong> [Tutar] ₺</p>

<h2>KİRA ARTIRIMI TALEBİ</h2>
<p>6098 sayılı Türk Borçlar Kanunu'nun 344. maddesi uyarınca, kira bedelinin artırılmasını talep ediyorum.</p>

<h2>YENİ KİRA BEDELİ</h2>
<p><strong>Önerilen Yeni Aylık Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Artış Oranı:</strong> %[Oran]<br>
<strong>Artış Gerekçesi:</strong> TÜFE artış oranı / Piyasa değeri</p>

<h2>YÜRÜRLÜK TARİHİ</h2>
<p>Yeni kira bedeli, [Tarih] tarihinden itibaren geçerli olacaktır.</p>

<h2>SEÇENEKLER</h2>
<p>Bu ihtarname ile sizi aşağıdaki seçeneklerden birini tercih etmeniz konusunda bilgilendiriyorum:</p>

<ol>
  <li><strong>Yeni Kira Bedelini Kabul:</strong> Yeni kira bedelini kabul ederseniz, [Tarih] tarihinden itibaren yeni bedel geçerli olacaktır.</li>
  
  <li><strong>İtiraz:</strong> Yeni kira bedeline itiraz ederseniz, [Gün] gün içinde yazılı olarak bildirmeniz gerekmektedir. İtiraz durumunda, kira bedeli mahkeme tarafından tespit edilecektir.</li>
  
  <li><strong>Sözleşmeyi Feshetme:</strong> Yeni kira bedelini kabul etmek istemezseniz, sözleşmeyi [Gün] gün içinde feshedebilirsiniz.</li>
</ol>

<h2>UYARI</h2>
<p>Belirtilen süre içinde itiraz etmezseniz, yeni kira bedelini kabul etmiş sayılacaksınız.</p>

<p>Saygılarımla,</p>

<div style="margin-top: 50px;">
  <p><strong>[Kiraya Veren Adı]</strong></p>
  <p>TC Kimlik No: [TC No]</p>
  <p>Adres: [Adres]</p>
  <p>İmza: _______________</p>
  <p>Tarih: [Tarih]</p>
</div>

<p><strong>NOT:</strong> Bu ihtarname, noter aracılığıyla veya iadeli taahhütlü posta ile gönderilmiştir.</p>`
  },
  {
    title: 'Konut Kira Sözleşmesi Fesih Protokolü',
    type: 'rent-termination',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>KONUT KİRA SÖZLEŞMESİ FESİH PROTOKOLÜ</h1>

<h2>1. TARAFLAR</h2>
<p><strong>KİRAYA VEREN:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<p><strong>KİRACI:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<h2>2. SÖZLEŞME BİLGİLERİ</h2>
<p><strong>Kira Sözleşmesi Tarihi:</strong> [Tarih]<br>
<strong>Konut Adresi:</strong> [Tam Adres]<br>
<strong>Aylık Kira Bedeli:</strong> [Tutar] ₺</p>

<h2>3. FESİH BİLGİLERİ</h2>
<p><strong>Fesih Tarihi:</strong> [Tarih]<br>
<strong>Fesih Sebebi:</strong> [Sebep]<br>
<strong>Tahliye Tarihi:</strong> [Tarih]</p>

<h2>4. FESİH ŞARTLARI</h2>
<ul>
  <li>Taraflar, kira sözleşmesini karşılıklı anlaşma ile feshetmişlerdir.</li>
  <li>Kiracı, konutu belirtilen tarihte boş ve temiz olarak teslim edecektir.</li>
  <li>Kira borçları kapatılmıştır.</li>
  <li>Depozito iadesi yapılacaktır.</li>
</ul>

<h2>5. BORÇLARIN KAPATILMASI</h2>
<p><strong>Kalan Kira Borcu:</strong> [Tutar] ₺<br>
<strong>Fatura Borçları:</strong> [Tutar] ₺<br>
<strong>Toplam Borç:</strong> [Tutar] ₺</p>

<h2>6. DEPOZİTO İADESİ</h2>
<p><strong>Depozito Tutarı:</strong> [Tutar] ₺<br>
<strong>Kesinti (Varsa):</strong> [Tutar] ₺<br>
<strong>İade Edilecek Tutar:</strong> [Tutar] ₺<br>
<strong>İade Tarihi:</strong> [Tarih]</p>

<h2>7. TAHLİYE</h2>
<p>Kiracı, konutu [Tarih] tarihinde boş, temiz ve hasarsız olarak teslim etmeyi taahhüt eder.</p>

<h2>8. DİĞER HÜKÜMLER</h2>
<ul>
  <li>Taraflar, birbirlerinden herhangi bir talepte bulunmayacaktır.</li>
  <li>Bu protokol, taraflar arasındaki tüm hak ve yükümlülükleri sona erdirir.</li>
  <li>Uyuşmazlık halinde [Şehir] Mahkemeleri yetkilidir.</li>
</ul>

<h2>9. SONUÇ</h2>
<p>Bu fesih protokolü [Tarih] tarihinde düzenlenmiş olup, iki nüsha halinde taraflarca imzalanmıştır.</p>

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
    title: 'Kira Depozitosu İade Talebi',
    type: 'deposit-refund',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>KİRA DEPOZİTOSU İADE TALEBİ</h1>

<p><strong>Sayın [Kiraya Veren Adı],</strong></p>

<p>TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<h2>KONU: DEPOZİTO İADESİ</h2>

<p>Yukarıda kimlik bilgileri yazılı kişi olarak, [Adres] adresindeki konutun eski kiracısıyım.</p>

<h2>KİRA SÖZLEŞMESİ BİLGİLERİ</h2>
<p><strong>Kira Sözleşmesi Tarihi:</strong> [Tarih]<br>
<strong>Konut Adresi:</strong> [Tam Adres]<br>
<strong>Depozito Tutarı:</strong> [Tutar] ₺<br>
<strong>Tahliye Tarihi:</strong> [Tarih]</p>

<h2>TAHLİYE DURUMU</h2>
<p>Konutu, belirtilen tarihte boş, temiz ve hasarsız olarak teslim ettim. Konutta herhangi bir hasar bulunmamaktadır.</p>

<h2>BORÇ DURUMU</h2>
<p>Tüm kira borçlarımı ve faturalarımı ödedim. Herhangi bir borcum bulunmamaktadır.</p>

<h2>İADE TALEBİ</h2>
<p>Yukarıda belirtilen bilgiler doğrultusunda, [Tutar] ₺ tutarındaki depozitomun iadesini talep ediyorum.</p>

<h2>İADE BİLGİLERİ</h2>
<p><strong>İade Edilecek Tutar:</strong> [Tutar] ₺<br>
<strong>İade Şekli:</strong> [Banka Havalesi/Nakit]<br>
<strong>Banka Hesap Bilgileri:</strong><br>
- Banka: [Banka Adı]<br>
- Şube: [Şube Adı]<br>
- Hesap No: [Hesap No]<br>
- IBAN: [IBAN]</p>

<h2>UYARI</h2>
<p>6098 sayılı Türk Borçlar Kanunu'nun 346. maddesi uyarınca, depozito iadesi konutun tesliminden sonra [Gün] gün içinde yapılmalıdır.</p>

<p>Belirtilen süre içinde depozito iadesi yapılmazsa, hukuki yollara başvurmak zorunda kalacağımı bildiririm.</p>

<p>Saygılarımla,</p>

<div style="margin-top: 50px;">
  <p><strong>[Kiracı Adı]</strong></p>
  <p>TC Kimlik No: [TC No]</p>
  <p>Adres: [Adres]</p>
  <p>Telefon: [Telefon]</p>
  <p>İmza: _______________</p>
  <p>Tarih: [Tarih]</p>
</div>`
  },
  {
    title: 'Kira Ödeme Belgesi',
    type: 'rent-receipt',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>KİRA ÖDEME BELGESİ</h1>

<h2>1. TARAFLAR</h2>
<p><strong>KİRAYA VEREN:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<p><strong>KİRACI:</strong> [Ad Soyad]<br>
TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<h2>2. KONUT BİLGİLERİ</h2>
<p><strong>Konut Adresi:</strong> [Tam Adres]<br>
<strong>Daire No:</strong> [Daire No]</p>

<h2>3. ÖDEME BİLGİLERİ</h2>
<p><strong>Ödeme Tarihi:</strong> [Tarih]<br>
<strong>Ödenen Dönem:</strong> [Ay/Yıl]<br>
<strong>Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Ödeme Şekli:</strong> [Nakit/Banka Havalesi/Çek]<br>
<strong>Makbuz No:</strong> [No]</p>

<h2>4. ÖDEME DETAYLARI</h2>
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="border: 1px solid #000; padding: 8px;"><strong>Kalem</strong></td>
    <td style="border: 1px solid #000; padding: 8px; text-align: right;"><strong>Tutar (₺)</strong></td>
  </tr>
  <tr>
    <td style="border: 1px solid #000; padding: 8px;">Aylık Kira Bedeli</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: right;">[Tutar]</td>
  </tr>
  <tr>
    <td style="border: 1px solid #000; padding: 8px;">Aidat</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: right;">[Tutar]</td>
  </tr>
  <tr>
    <td style="border: 1px solid #000; padding: 8px;">Diğer</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: right;">[Tutar]</td>
  </tr>
  <tr>
    <td style="border: 1px solid #000; padding: 8px;"><strong>TOPLAM</strong></td>
    <td style="border: 1px solid #000; padding: 8px; text-align: right;"><strong>[Tutar]</strong></td>
  </tr>
</table>

<h2>5. BORÇ DURUMU</h2>
<p><strong>Önceki Borç:</strong> [Tutar] ₺<br>
<strong>Bu Dönem Ödemesi:</strong> [Tutar] ₺<br>
<strong>Kalan Borç:</strong> [Tutar] ₺</p>

<h2>6. ONAY</h2>
<p>Yukarıda belirtilen tutar, [Tarih] tarihinde alınmıştır.</p>

<div style="margin-top: 50px;">
  <div style="display: flex; justify-content: space-between;">
    <div>
      <p><strong>KİRAYA VEREN</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
      <p>[Ad Soyad]</p>
    </div>
    <div>
      <p><strong>KİRACI</strong></p>
      <p style="margin-top: 50px;">[İmza]</p>
      <p>[Ad Soyad]</p>
    </div>
  </div>
</div>

<p style="margin-top: 30px;"><strong>NOT:</strong> Bu belge, kira ödemesinin yapıldığını gösterir. Lütfen bu belgeyi saklayınız.</p>`
  },
  {
    title: 'Kiracının Kira Sözleşmesini Sonlandırma Bildirimi',
    type: 'tenant-termination',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>KİRA SÖZLEŞMESİNİ SONLANDIRMA BİLDİRİMİ</h1>

<p><strong>Sayın [Kiraya Veren Adı],</strong></p>

<p>TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<h2>KONU: KİRA SÖZLEŞMESİNİN FESHİ</h2>

<p>Yukarıda kimlik bilgileri yazılı kişi olarak, [Adres] adresindeki konutun kiracısıyım.</p>

<h2>KİRA SÖZLEŞMESİ BİLGİLERİ</h2>
<p><strong>Kira Sözleşmesi Tarihi:</strong> [Tarih]<br>
<strong>Konut Adresi:</strong> [Tam Adres]<br>
<strong>Aylık Kira Bedeli:</strong> [Tutar] ₺</p>

<h2>FESİH TALEBİ</h2>
<p>6098 sayılı Türk Borçlar Kanunu'nun 347. maddesi uyarınca, kira sözleşmesini feshetmek istiyorum.</p>

<h2>FESİH SEBEBİ</h2>
<p>Kira sözleşmesini feshetme sebebim aşağıdaki gibidir:</p>
<ul>
  <li>[Sebep 1]</li>
  <li>[Sebep 2]</li>
  <li>[Sebep 3]</li>
</ul>

<h2>TAHLİYE TARİHİ</h2>
<p>Konutu, [Tarih] tarihinde boş ve temiz olarak teslim edeceğim.</p>

<h2>BORÇLARIN KAPATILMASI</h2>
<p>Tüm kira borçlarımı ve faturalarımı ödeyeceğim. Borçlarım kapatıldıktan sonra depozito iadesi yapılmasını talep ediyorum.</p>

<h2>DİĞER YÜKÜMLÜLÜKLER</h2>
<ul>
  <li>Konutu hasarsız teslim edeceğim.</li>
  <li>Yapılan değişiklikleri (varsa) eski haline getireceğim.</li>
  <li>Aboneliklerimi (elektrik, su, doğalgaz vb.) kapatacağım.</li>
</ul>

<h2>SONUÇ</h2>
<p>Bu bildirim ile kira sözleşmesini [Tarih] tarihinde feshetmiş bulunuyorum. Konutu belirtilen tarihte teslim edeceğim.</p>

<p>Saygılarımla,</p>

<div style="margin-top: 50px;">
  <p><strong>[Kiracı Adı]</strong></p>
  <p>TC Kimlik No: [TC No]</p>
  <p>Adres: [Adres]</p>
  <p>Telefon: [Telefon]</p>
  <p>İmza: _______________</p>
  <p>Tarih: [Tarih]</p>
</div>

<p><strong>NOT:</strong> Bu bildirim, noter aracılığıyla veya iadeli taahhütlü posta ile gönderilmiştir.</p>`
  },
  {
    title: 'Kira Gecikmesi İçin İhtarname',
    type: 'rent-delay-notice',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>KİRA GECİKMESİ İÇİN İHTARNAME</h1>

<p><strong>Sayın [Kiracı Adı],</strong></p>

<p>TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<h2>KONU: KİRA BEDELİNİN ÖDENMEMESİ</h2>

<p>Yukarıda kimlik bilgileri yazılı kişi olarak, [Adres] adresindeki konutun kiracısısınız.</p>

<h2>KİRA SÖZLEŞMESİ BİLGİLERİ</h2>
<p><strong>Kira Sözleşmesi Tarihi:</strong> [Tarih]<br>
<strong>Aylık Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Ödeme Günü:</strong> Her ayın [Gün]'ü</p>

<h2>GECİKMİŞ ÖDEMELER</h2>
<p>Aşağıda belirtilen dönemlere ait kira bedellerini ödemediniz:</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="border: 1px solid #000; padding: 8px;"><strong>Dönem</strong></td>
    <td style="border: 1px solid #000; padding: 8px; text-align: right;"><strong>Tutar (₺)</strong></td>
    <td style="border: 1px solid #000; padding: 8px;"><strong>Vade Tarihi</strong></td>
  </tr>
  <tr>
    <td style="border: 1px solid #000; padding: 8px;">[Ay/Yıl]</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: right;">[Tutar]</td>
    <td style="border: 1px solid #000; padding: 8px;">[Tarih]</td>
  </tr>
  <tr>
    <td style="border: 1px solid #000; padding: 8px;">[Ay/Yıl]</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: right;">[Tutar]</td>
    <td style="border: 1px solid #000; padding: 8px;">[Tarih]</td>
  </tr>
  <tr>
    <td style="border: 1px solid #000; padding: 8px;"><strong>TOPLAM</strong></td>
    <td style="border: 1px solid #000; padding: 8px; text-align: right;"><strong>[Tutar]</strong></td>
    <td style="border: 1px solid #000; padding: 8px;"></td>
  </tr>
</table>

<h2>GECİKME TAZMİNATI</h2>
<p>6098 sayılı Türk Borçlar Kanunu uyarınca, gecikme tazminatı hesaplanacaktır.</p>
<p><strong>Gecikme Tazminatı:</strong> [Tutar] ₺</p>

<h2>TOPLAM BORÇ</h2>
<p><strong>Gecikmiş Kira Bedeli:</strong> [Tutar] ₺<br>
<strong>Gecikme Tazminatı:</strong> [Tutar] ₺<br>
<strong>TOPLAM BORÇ:</strong> [Tutar] ₺</p>

<h2>ÖDEME TALEBİ</h2>
<p>Bu ihtarname ile sizi, yukarıda belirtilen toplam borcun [Tarih] tarihine kadar ödemeniz konusunda ihtar ediyorum.</p>

<h2>UYARI</h2>
<p>Belirtilen süre içinde borcunuzu ödemezseniz:</p>
<ul>
  <li>Kira sözleşmesini feshedeceğim,</li>
  <li>Tahliye davası açacağım,</li>
  <li>İcra takibi başlatacağım.</li>
</ul>
<p>Bu durumda yargılama giderleri, icra giderleri ve avukatlık ücretleri size yükletilecektir.</p>

<p>Saygılarımla,</p>

<div style="margin-top: 50px;">
  <p><strong>[Kiraya Veren Adı]</strong></p>
  <p>TC Kimlik No: [TC No]</p>
  <p>Adres: [Adres]</p>
  <p>İmza: _______________</p>
  <p>Tarih: [Tarih]</p>
</div>

<p><strong>NOT:</strong> Bu ihtarname, noter aracılığıyla veya iadeli taahhütlü posta ile gönderilmiştir.</p>`
  },
  {
    title: 'Kiracının Kiralanan Konutta Yenilik veya Değişiklik Yapılması Talebi',
    type: 'renovation-request',
    version: '1.0',
    isActive: true,
    isRequired: false,
    language: 'tr',
    content: `<h1>YENİLİK VEYA DEĞİŞİKLİK YAPILMASI TALEBİ</h1>

<p><strong>Sayın [Kiraya Veren Adı],</strong></p>

<p>TC Kimlik No: [TC No]<br>
Adres: [Adres]</p>

<h2>KONU: KONUTTA YENİLİK/DEĞİŞİKLİK TALEBİ</h2>

<p>Yukarıda kimlik bilgileri yazılı kişi olarak, [Adres] adresindeki konutun kiracısıyım.</p>

<h2>KİRA SÖZLEŞMESİ BİLGİLERİ</h2>
<p><strong>Kira Sözleşmesi Tarihi:</strong> [Tarih]<br>
<strong>Konut Adresi:</strong> [Tam Adres]</p>

<h2>YAPILMAK İSTENEN YENİLİK/DEĞİŞİKLİKLER</h2>
<p>Aşağıda belirtilen yenilik veya değişikliklerin yapılmasını talep ediyorum:</p>

<ol>
  <li><strong>[Yenilik/Değişiklik 1]</strong><br>
  Açıklama: [Detaylı Açıklama]<br>
  Yapılacak İş: [İş Detayı]<br>
  Tahmini Maliyet: [Tutar] ₺</li>
  
  <li><strong>[Yenilik/Değişiklik 2]</strong><br>
  Açıklama: [Detaylı Açıklama]<br>
  Yapılacak İş: [İş Detayı]<br>
  Tahmini Maliyet: [Tutar] ₺</li>
</ol>

<h2>YENİLİK/DEĞİŞİKLİK GEREKÇESİ</h2>
<p>Yukarıda belirtilen yenilik/değişikliklerin yapılma gerekçesi:</p>
<ul>
  <li>[Gerekçe 1]</li>
  <li>[Gerekçe 2]</li>
  <li>[Gerekçe 3]</li>
</ul>

<h2>MALİYET VE SORUMLULUK</h2>
<p><strong>Toplam Tahmini Maliyet:</strong> [Tutar] ₺</p>
<p><strong>Maliyet Sorumluluğu:</strong> [Kiracı/Kiraya Veren/Ortak]</p>
<p><strong>İş Yapım Süresi:</strong> [Gün] gün</p>

<h2>YENİLİK/DEĞİŞİKLİK ŞARTLARI</h2>
<ul>
  <li>Yenilik/değişiklikler, konutun yapısına zarar vermeyecek şekilde yapılacaktır.</li>
  <li>Gerekli izinler alınacaktır.</li>
  <li>İşler, profesyonel kişiler tarafından yapılacaktır.</li>
  <li>Sözleşme sonunda, istenirse değişiklikler eski haline getirilecektir.</li>
</ul>

<h2>ONAY TALEBİ</h2>
<p>Yukarıda belirtilen yenilik/değişikliklerin yapılması için onayınızı talep ediyorum.</p>

<p>Onayınız halinde, işlere [Tarih] tarihinde başlamayı planlıyorum.</p>

<p>Saygılarımla,</p>

<div style="margin-top: 50px;">
  <p><strong>[Kiracı Adı]</strong></p>
  <p>TC Kimlik No: [TC No]</p>
  <p>Adres: [Adres]</p>
  <p>Telefon: [Telefon]</p>
  <p>İmza: _______________</p>
  <p>Tarih: [Tarih]</p>
</div>

<h2>ONAY BÖLÜMÜ (KİRAYA VEREN TARAFINDAN DOLDURULACAK)</h2>
<p>Yukarıda belirtilen yenilik/değişiklik talebi:</p>
<p>☐ Onaylanmıştır</p>
<p>☐ Reddedilmiştir</p>
<p><strong>Gerekçe:</strong> [Gerekçe]</p>

<div style="margin-top: 30px;">
  <p><strong>[Kiraya Veren Adı]</strong></p>
  <p>TC Kimlik No: [TC No]</p>
  <p>İmza: _______________</p>
  <p>Tarih: [Tarih]</p>
</div>`
  }
];

async function createHousingContracts() {
  try {
    console.log('Konut ve gayrimenkul dilekçe örnekleri oluşturuluyor...\n');

    for (const contract of housingContracts) {
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

    console.log('\n✅ Tüm konut ve gayrimenkul dilekçe örnekleri başarıyla oluşturuldu!');
    console.log('\nOluşturulan sözleşmeler:');
    housingContracts.forEach((c, i) => {
      console.log(`${i + 1}. ${c.title} (${c.type})`);
    });
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createHousingContracts();

