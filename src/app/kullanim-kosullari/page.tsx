import React from 'react';

export default function TermsOfUsePage() {
  const lastUpdated = '19.01.2026';
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Kullanım Koşulları</h1>
      
      <div className="prose max-w-none">
        <p className="text-gray-700">
          Bu metin, <strong>Alo17.tr</strong> (“Platform”) üzerinden sunulan hizmetlerin kullanımına ilişkin koşulları
          düzenler. Platform’u ziyaret ederek veya üye olarak bu koşulları kabul etmiş sayılırsınız.
        </p>
        <p className="text-gray-700">
          <strong>Not:</strong> Bu metin genel bilgilendirme amaçlıdır; faaliyet alanınıza göre avukat/uzman ile
          gözden geçirmeniz önerilir.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-10">
          <h2 className="text-xl font-semibold mb-3">İçindekiler</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li><a href="#genel">Genel</a></li>
            <li><a href="#temel-kavramlar">Temel Kavramlar</a></li>
            <li><a href="#hizmetler">Hizmetler ve Kullanım Kuralları</a></li>
            <li><a href="#uyelik">Üyelik, Hesap Güvenliği</a></li>
            <li><a href="#ilan">İlan/İçerik Kuralları</a></li>
            <li><a href="#kotu-amacli">Kötü Amaçlı Faaliyetler ve Güvenlik</a></li>
            <li><a href="#moderasyon">Moderasyon ve Yaptırımlar</a></li>
            <li><a href="#fikri-mulkiyet">Fikri Mülkiyet</a></li>
            <li><a href="#veriler">Kişisel Veriler ve Çerezler</a></li>
            <li><a href="#ucretler">Ücretler / Premium (Varsa)</a></li>
            <li><a href="#degisiklikler">Değişiklikler</a></li>
            <li><a href="#yetki">Uygulanacak Hukuk ve Yetki</a></li>
            <li><a href="#iletisim">İletişim</a></li>
          </ol>
        </div>

        <section id="genel" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">I. Genel</h2>
          <p>
            Bu koşullar, Platform’u kullanan kişi ile Platform’un işletilmesinden sorumlu olan Alo17.tr arasında, Platform
            üzerinden sunulan hizmetlerin kullanımını düzenler. Platform’daki bazı sayfalar üyelik gerektirmeden
            kullanılabilir; üyelik gerektiren özelliklerde (ilan verme, mesajlaşma vb.) ek doğrulamalar istenebilir.
          </p>
          <p className="mt-3">
            Platform’u kullanmanız; bu koşulları, ayrıca kişisel verilerin işlenmesine ilişkin{' '}
            <a href="/gizlilik">Gizlilik Politikası</a>, <a href="/kvkk">KVKK Aydınlatma</a> ve{' '}
            <a href="/cerez-politikasi">Çerez Politikası</a> metinlerini okuduğunuz ve kabul ettiğiniz anlamına gelir.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">I.1. Sözleşmenin niteliği</h3>
          <p>
            Bu metin, Platform’u kullanma hakkınızı ve kullanım sınırlarınızı belirleyen bir sözleşme hükmündedir. Üyelik
            gerektirmeyen hizmetleri kullanmanız da bu koşulları kabul ettiğiniz anlamına gelir.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">I.2. Kapsam</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Web sitesi ve (varsa) mobil uygulama üzerinden sunulan tüm hizmetler</li>
            <li>İlan yayınlama, arama/filtreleme, favoriler, mesajlaşma ve bildirim özellikleri</li>
            <li>Premium/öne çıkarma/doping gibi tanıtım özellikleri (varsa)</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-3">I.3. Hizmet sürekliliği</h3>
          <p>
            Platform’un kesintisiz çalışacağı garanti edilmez. Bakım, güncelleme, yoğunluk, altyapı arızaları veya üçüncü
            taraf hizmetlerinde yaşanan kesintiler nedeniyle hizmet geçici olarak durabilir.
          </p>
        </section>

        <section id="temel-kavramlar" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">II. Temel Kavramlar</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Platform</strong>: Alo17.tr web sitesi ve ilişkili alt alan adları, uygulamalar ve servisler.
            </li>
            <li>
              <strong>İşletmeci</strong>: Alo17.tr’nin hizmetlerini işleten ve Platform’u yöneten taraf.
            </li>
            <li>
              <strong>Kullanıcı</strong>: Platform’u ziyaret eden, üye olan veya ilan/içerik oluşturan gerçek ya da tüzel kişi.
            </li>
            <li>
              <strong>Üye</strong>: Platform’da hesap oluşturan kullanıcı.
            </li>
            <li>
              <strong>İlan</strong>: Kullanıcı tarafından Platform’a yüklenen ürün/hizmet/iş ilanı içerikleri.
            </li>
            <li>
              <strong>İçerik</strong>: Metin, görsel, video, mesaj, yorum, değerlendirme ve benzeri tüm kullanıcı verileri.
            </li>
            <li>
              <strong>Aracı Hizmet Sağlayıcı</strong>: Platform; kullanıcıları buluşturur, ilanlara konu ürün/hizmetin
              satıcısı/sağlayıcısı değildir.
            </li>
            <li>
              <strong>Ortak kullanım/ilişkilendirme</strong>: Kötüye kullanımı önlemek için, aynı cihaz/ağ/hesap davranışları
              gibi işaretler üzerinden hesaplar ilişkilendirilebilir ve güvenlik kontrolleri uygulanabilir.
            </li>
            <li>
              <strong>Tanıtım/Premium</strong>: İlanların görünürlüğünü artırmaya yönelik, süre/kapsamı belirli ücretli veya ücretsiz
              (kampanya vb.) özellikler.
            </li>
          </ol>
          <h3 className="text-xl font-semibold mt-6 mb-3">II.1. Aracı hizmet sağlayıcı rolü</h3>
          <p>
            Platform, ilanlara konu ürün/hizmetin satıcısı veya sağlayıcısı değildir. Alım-satım/hizmet ilişkisi kullanıcılar
            arasında kurulur; Platform taraf değildir.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">II.2. Ortak kullanım ve ilişkilendirme</h3>
          <p>
            Kötüye kullanımı önlemek için; aynı cihaz, aynı ağ/IP, benzer ilan örüntüsü, kısa sürede yüksek işlem hacmi gibi
            sinyaller üzerinden hesaplar ilişkilendirilebilir. Bu durum ek doğrulama veya kısıtlamalara yol açabilir.
          </p>
        </section>

        <section id="hizmetler" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">III. Hizmetler ve Kullanım Kuralları</h2>
          <p>
            Platform’da sunulan hizmetler aşağıdakilerle sınırlı olmamak üzere şunları kapsar:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-1">
            <li>İlan oluşturma, düzenleme, yayınlama ve yönetme</li>
            <li>İlan arama, filtreleme, kategori gezinimi</li>
            <li>İlanları favorileme ve görüntüleme</li>
            <li>Kullanıcılar arası mesajlaşma</li>
            <li>İlanların öne çıkarılması / premium görünürlük seçenekleri (varsa)</li>
            <li>Bildirim ve duyuru altyapısı (varsa)</li>
          </ul>
          <p className="mt-4">
            Kullanıcı, Platform’u kullanırken mevzuata uygun davranmayı, başkalarının haklarına saygı göstermeyi ve
            Platform’un teknik bütünlüğünü zedeleyecek eylemlerden kaçınmayı kabul eder.
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-1">
            <li>Platform içeriği, yalnızca kişisel ve ticari amaçlarla görüntülenebilir; yetkisiz toplu kopyalama yasaktır.</li>
            <li>Platform’da yer alan içerikler, kamuya açık olsa dahi başka yerde yeniden yayınlanırken haklara saygı gösterilmelidir.</li>
            <li>Platform’un işleyişini bozacak şekilde aşırı istek/otomasyon kullanılamaz.</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-3">III.1. Erişim kuralları</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Platform’u kullanırken yürürlükteki mevzuata ve bu koşullara uygun davranmalısınız.</li>
            <li>Yetkisiz erişim, sistem taraması, bot/scraping ve benzeri otomasyonlar yasaktır.</li>
            <li>Platform, güvenlik için oran sınırlama (rate limit), captcha veya doğrulama adımları uygulayabilir.</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-3">III.2. Üçüncü taraf bağlantılar</h3>
          <p>
            Platform’da üçüncü taraf sitelere bağlantılar bulunabilir. Bu sitelerin içeriği ve güvenliği üçüncü tarafların
            sorumluluğundadır. Kullanıcı, bu bağlantıları kullanırken kendi risk değerlendirmesini yapar.
          </p>
        </section>

        <section id="uyelik" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">IV. Üyelik, Hesap Güvenliği, Temsil</h2>
          <p>
            Üyelik sırasında verdiğiniz bilgilerin doğruluğundan siz sorumlusunuz. Hesabınızla yapılan işlemler
            (ilan ekleme/düzenleme, mesajlaşma vb.) hesabı kullanan kişi tarafından yapılmış sayılır.
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-1">
            <li><strong>Şifre/erişim güvenliği</strong>: Erişim bilgilerinizi kimseyle paylaşmayın.</li>
            <li><strong>Yaş</strong>: 18 yaş altı kullanıcıların Platform’u veli/vasisi gözetiminde kullanması beklenir.</li>
            <li><strong>Temsil</strong>: Tüzel kişi adına işlem yapıyorsanız gerekli yetkiye sahip olduğunuzu taahhüt edersiniz.</li>
            <li><strong>Hesap kapatma</strong>: Talep halinde ve mevzuatın izin verdiği ölçüde hesabınız kapatılabilir.</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-3">IV.1. Doğrulama ve güvenlik kontrolleri</h3>
          <p>
            Platform; güvenlik, dolandırıcılığı önleme ve hizmet kalitesi amaçlarıyla belirli işlemlerde ek doğrulama (SMS/e-posta,
            captcha, cihaz doğrulama vb.) talep edebilir.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">IV.2. Hesap devri ve paylaşımı</h3>
          <p>
            Hesabın başkasına devri veya sürekli paylaşımı yasaktır. Yetkisiz kullanım şüphesi halinde Platform hesabı geçici olarak
            askıya alabilir ve doğrulama isteyebilir.
          </p>
        </section>

        <section id="ilan" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">V. İlan/İçerik Kuralları</h2>
          <p>
            İlan/İçerik paylaşırken yürürlükteki mevzuata ve genel ahlak kurallarına uygun davranmalısınız. Aşağıdakiler
            yasaktır:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-1">
            <li>Yasal olmayan ürün/hizmet satışı, dolandırıcılık, sahtecilik, yanıltıcı beyan</li>
            <li>Nefret söylemi, şiddet, taciz, tehdit, müstehcenlik ve çocukların istismarına dair her türlü içerik</li>
            <li>Telif/marka/kişilik hakkı ihlali (başkasına ait görsel/metin kullanımı vb.)</li>
            <li>Kişisel veri ifşası (TC kimlik no, açık adres, banka bilgisi vb.) veya izinsiz iletişim bilgisi paylaşımı</li>
            <li>Spam, yönlendirme linkleri, zararlı yazılım içeriği</li>
          </ul>
          <p className="mt-4">
            İlanlarda <strong>doğru fiyat</strong>, <strong>doğru kategori</strong>, <strong>güncel iletişim</strong> ve ürün/hizmetin
            gerçek durumunu yansıtan açıklamalar kullanılması beklenir. Yanıltıcı başlık/etiket/konum kullanımı ihlal sayılır.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">V.1. Çoklu ilan / tekrar / spam</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Aynı ürün/hizmet için tekrar eden ilanlar, kullanıcı deneyimini bozduğu için kısıtlanabilir.</li>
            <li>Şablon metinlerle toplu ilan girişi, kategori dışı “anahtar kelime doldurma” (keyword stuffing) ihlal sayılabilir.</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-3">V.2. Görsel ve açıklama kuralları</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Başkasına ait görsellerin izinsiz kullanımı yasaktır.</li>
            <li>Görsellerde yanıltıcı logo/filigran veya aldatıcı bilgi kullanımı ihlal sayılabilir.</li>
            <li>İlan açıklaması; ürün/hizmetin gerçek durumunu yansıtmalı, gizlenmiş ücret/komisyon içermemelidir.</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-3">V.3. Yasaklı içerik örnekleri</h3>
          <p>
            Mevzuata aykırı ürün/hizmetler, telif ihlali içeren ürünler, sahte/kaçak ürünler, açıkça dolandırıcılığa yönelik ilanlar
            ve kullanıcıları yanıltan “ödeme/kargo linki” gibi yönlendirmeler yasaktır.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">V.4. İlan süresi ve görünürlük</h3>
          <p>
            İlanların Platform’da görünür kalma süresi, kategori yoğunluğu, moderasyon ve teknik koşullara bağlı olarak değişebilir.
            Platform, hizmet kalitesi için bazı ilanları arşivleyebilir veya yeniden doğrulama isteyebilir.
          </p>
        </section>

        <section id="kotu-amacli" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">VI. Kötü Amaçlı Faaliyetler ve Güvenlik</h2>
          <p>
            Platform’un güvenliği ve hizmet kalitesi için aşağıdaki eylemler yasaktır. Bu tür eylemler tespit edildiğinde
            erişim engeli, hesap kısıtı ve gerekli durumlarda yasal mercilere bildirim yapılabilir:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-1">
            <li>Otomatik bot kullanımı, veri çekme (scraping) ve aşırı istek gönderimi</li>
            <li>Sistem açıklarını arama, tarama (port/endpoint taraması) ve yetkisiz erişim denemeleri</li>
            <li>Zararlı yazılım/virüs/link yayma, kimlik avı (phishing) girişimleri</li>
            <li>Hizmet reddi saldırıları (DoS/DDoS) veya benzeri trafik üretimi</li>
            <li>Hesap ele geçirme, şifre deneme, brute-force girişimleri</li>
          </ul>
          <p className="mt-4">
            Güvenlik nedeniyle; IP, cihaz, oturum, kullanıcı ajanı gibi teknik veriler ile erişim/log kayıtları tutulabilir.
            Detaylar için <a href="/gizlilik">Gizlilik Politikası</a> ve <a href="/kvkk">KVKK Aydınlatma</a> metinlerine bakın.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">VI.1. Güvenlik tedbirleri</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Şüpheli oturumlarda ek doğrulama, hız sınırlama ve geçici erişim engeli uygulanabilir.</li>
            <li>Şüpheli bağlantılar, zararlı içerik veya kimlik avı tespitinde içerik kaldırılabilir.</li>
            <li>Gerektiğinde adli/idari mercilerle mevzuat çerçevesinde iş birliği yapılabilir.</li>
          </ul>
        </section>

        <section id="moderasyon" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">VII. Moderasyon ve Yaptırımlar</h2>
          <p>
            Platform, içeriklerin mevzuata ve bu koşullara uygunluğunu sağlamak amacıyla ilanları inceleyebilir; uygun
            görmediği içerikleri yayından kaldırabilir, düzenleme isteyebilir veya hesabınızı geçici/kalıcı olarak
            kısıtlayabilir.
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-1">
            <li>İlanın taslakta bırakılması, reddedilmesi veya yayından kaldırılması</li>
            <li>Kategori/başlık/içerik düzeltme talebi</li>
            <li>Mesajlaşma/ilan verme özelliklerinin kısıtlanması</li>
            <li>Hesabın askıya alınması veya kapatılması</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-3">VII.1. Hukuka aykırı içerik bildirimi</h3>
          <p>
            Hak ihlali veya hukuka aykırı içerik bildirimi; ilan bağlantısı, açıklama ve mümkünse kanıt (ekran görüntüsü vb.)
            ile iletilmelidir. İnceleme sonucunda içerik kaldırılabilir veya düzeltme istenebilir.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">VII.2. İtiraz ve değerlendirme</h3>
          <p>
            İçerik kaldırma veya hesap kısıtına itiraz etmek için destek kanallarından başvurabilirsiniz. İnceleme sonucunda karar
            korunabilir, değiştirilebilir veya ek bilgi talep edilebilir.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">VII.3. Tekrarlayan ihlaller</h3>
          <p>
            Tekrarlayan ihlaller veya ağır ihlallerde, Platform bildirim yapmaksızın kalıcı kısıt uygulayabilir.
          </p>
        </section>

        <section id="fikri-mulkiyet" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">VIII. Fikri Mülkiyet</h2>
          <p>
            Platform’un arayüzü, logosu, tasarımı ve yazılımı Alo17.tr’ye aittir. Kullanıcılar kendi yükledikleri içerikten
            sorumludur ve içerik üzerinde gerekli haklara sahip olduklarını beyan eder.
          </p>
          <p className="mt-3">
            Kullanıcı, Platform’a yüklediği içeriklerin Platform üzerinde görüntülenmesi, indekslenmesi ve hizmetin
            sunulması için gerekli ölçüde işlenmesi için Alo17.tr’ye sınırlı bir kullanım izni verir.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">VIII.1. Platform içeriklerinin kullanımı</h3>
          <p>
            Platform’daki metin, logo, tasarım ve yazılım bileşenleri Alo17.tr’ye aittir. İzinsiz kopyalama, çoğaltma ve dağıtım
            yasaktır.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">VIII.2. Kullanıcı içerikleri</h3>
          <p>
            Kullanıcı, paylaştığı içerikler üzerinde gerekli haklara sahip olduğunu taahhüt eder. Üçüncü kişilerin hak iddialarında
            sorumluluk içerik sahibine aittir.
          </p>
        </section>

        <section id="veriler" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">IX. Kişisel Veriler ve Çerezler</h2>
          <p>
            Kişisel verilerin işlenmesine ilişkin detaylar için{' '}
            <a href="/gizlilik">Gizlilik Politikası</a>, <a href="/kvkk">KVKK Aydınlatma</a> ve{' '}
            <a href="/cerez-politikasi">Çerez Politikası</a> sayfalarını inceleyebilirsiniz.
          </p>
          <p className="mt-3">
            Tarayıcınızdan çerezleri yönetebilir/engelleyebilirsiniz; ancak bazı özellikler (oturum, güvenlik, tercihlerin
            hatırlanması vb.) kısıtlı çalışabilir.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">IX.1. Toplanan veri kategorileri (özet)</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hesap bilgileri (ad/soyad, e-posta, telefon vb. — sağlandığı ölçüde)</li>
            <li>İlan ve içerikler (metin, görsel, mesaj içerikleri)</li>
            <li>Teknik veriler (IP, cihaz, tarayıcı, log kayıtları)</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-3">IX.2. Saklama ve güvenlik</h3>
          <p>
            Veriler, mevzuata uygun sürelerde ve güvenlik tedbirleriyle saklanır. Ayrıntılar ilgili politikalarda yer alır.
          </p>
        </section>

        <section id="ucretler" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">X. Ücretler / Premium (Varsa)</h2>
          <p>
            Platform’da bazı özellikler ücretsiz, bazıları ücretli (premium/öne çıkarma/doping vb.) olabilir. Ücretli
            özelliklerin kapsamı, süresi ve bedeli satın alma ekranında belirtilir.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">X.1. Tanıtım türleri (örnek)</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Öne Çıkan</strong>: Ana sayfa veya kategori listelerinde üst sıralarda görünürlük.</li>
            <li><strong>Vitrin</strong>: Belirli alanlarda daha büyük kart/etiket ile gösterim.</li>
            <li><strong>Doping</strong>: Süreli olarak görüntülenme artışı sağlayan seçenekler.</li>
          </ul>
          <p className="mt-4">
            Tanıtım/premium özelliklerin görünürlüğü; kullanıcı filtreleri, kategori yoğunluğu, teknik kısıtlar ve
            moderasyon süreçlerinden etkilenebilir.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">X.2. İade/iptal</h3>
          <p>
            İade/iptal süreçleri, satın alma anındaki bilgilendirme ve ilgili mevzuat çerçevesinde değerlendirilir. İhlal
            nedeniyle yayından kaldırılan ilanlarda, mevzuatın izin verdiği ölçüde işlem yapılır.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">X.3. Ödeme sağlayıcıları</h3>
          <p>
            Ödemeler, üçüncü taraf ödeme sağlayıcıları üzerinden alınabilir. Ödeme sağlayıcılarının kendi güvenlik ve işlem kuralları
            geçerli olabilir.
          </p>
        </section>

        <section id="degisiklikler" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">XI. Değişiklikler</h2>
          <p>
            Bu kullanım koşulları zaman zaman güncellenebilir. Değişiklikler Platform’da yayınlandığı tarihte yürürlüğe girer.
            Platform’u kullanmaya devam etmeniz, güncel metni kabul ettiğiniz anlamına gelir.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">XI.1. Yürürlük</h3>
          <p>
            Güncellenen metin, yayınlandığı tarihte yürürlüğe girer.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">XI.2. Bildirim</h3>
          <p>
            Önemli değişikliklerde Platform içi duyuru veya e-posta gibi yollarla bilgilendirme yapılabilir.
          </p>
        </section>

        <section id="yetki" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">XII. Uygulanacak Hukuk ve Yetki</h2>
          <p>
            Bu koşullar Türkiye Cumhuriyeti mevzuatına tabidir. Uyuşmazlıklarda, zorunlu haller saklı kalmak üzere
            Çanakkale mahkemeleri ve icra daireleri yetkilidir.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-3">XII.1. Uyuşmazlık çözümü</h3>
          <p>
            Taraflar, uyuşmazlıkları öncelikle uzlaşı ile çözmeye gayret eder. Gerekli hallerde yasal yollara başvurulabilir.
          </p>
        </section>

        <section id="iletisim" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">XIII. İletişim</h2>
          <p>
            Kullanım koşulları hakkında sorularınız veya bildirimleriniz için aşağıdaki kanalları kullanabilirsiniz:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>E-posta: destek@alo17.tr</li>
            <li>Telefon: 0541 404 2 404</li>
            <li>Adres: Cevatpaşa Mahallesi, Bayrak Sokak No:4, Çanakkale</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-3">XIII.1. Bildirim formatı</h3>
          <p>
            Hukuka aykırı içerik/şikayet bildirimlerinde ilan bağlantısı, açıklama ve varsa kanıt (ekran görüntüsü vb.) paylaşmanız
            incelemeyi hızlandırır.
          </p>
        </section>

        <div className="bg-gray-50 rounded-xl p-6 mt-10">
          <p className="text-gray-600 text-sm">Son güncelleme: {lastUpdated}</p>
        </div>

        {/* --- Legacy sections removed below; content replaced with structured agreement format above --- */}
        {null}

        {/* The rest of the old page content is intentionally omitted. */}

        <section className="mb-8 hidden">
          <h2 className="text-2xl font-semibold mb-4">I. Tanımlar</h2>
          <ul className="list-disc pl-6 mt-4">
            <li>
              <strong>Platform</strong>: Alo17.tr web sitesi ve ilişkili alt alan adları, uygulamalar ve servisler.
            </li>
            <li>
              <strong>Kullanıcı</strong>: Platform’u ziyaret eden, üye olan veya ilan/ içerik oluşturan gerçek ya da
              tüzel kişi.
            </li>
            <li>
              <strong>İlan</strong>: Kullanıcılar tarafından Platform’a yüklenen ürün/hizmet/iş ilanı içerikleri.
            </li>
            <li>
              <strong>İçerik</strong>: Metin, görsel, video, mesaj, yorum, değerlendirme ve benzeri tüm kullanıcı verileri.
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
} 
