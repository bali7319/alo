## Alo17 (Android) — Play Console Data safety / Permissions Şablonu

> Bu doküman, repodaki mevcut koda göre hazırlanmıştır (Next.js web + Capacitor Android wrapper).
> Android tarafında ekstra sensör izinleri yok; web tarafında da `Permissions-Policy` ile kamera/mikrofon/konum kapalıdır.

### 1) Android izinleri (Manifest)
- **INTERNET**: Var (uygulama `https://alo17.tr` içeriğini yükler)
- **Kamera / Mikrofon / Konum**: Yok
- **Bildirim (POST_NOTIFICATIONS)**: Yok

### 2) Web tarafında izinler
- Sunucu güvenlik header’ı: `Permissions-Policy: camera=(), microphone=(), geolocation=()`  
  Bu nedenle tarayıcı API’leri üzerinden kamera/mikrofon/konum erişimi **engellenir**.

### 3) Uygulama hangi verileri toplayabilir? (backend)
Prisma şemasına göre platformda şu tür veriler vardır:
- **Kişisel bilgiler / İletişim**: ad (ops.), e‑posta, telefon (ops.), profil fotoğrafı (ops.)
- **Konum (metin olarak)**: kullanıcı veya ilan için “location” alanı (GPS değil; serbest metin/ilçe/şehir vb.)
- **Kullanıcı üretimi içerik**: ilan başlığı/açıklaması/fiyatı/kategori/ilan görselleri, mesaj içerikleri
- **Ödeme / faturalama**: abonelik/premium, fatura adı/e‑posta/telefon, vergi no/TC kimlik (ops.) gibi alanlar
- **Güvenlik / kötüye kullanım önleme**: IP bazlı rate limit ve loglama (sunucu tarafı)

### 4) “Data safety” ekranında genel yönlendirme (kopyala-yapıştır mantığı)
Play Console → **App content** → **Data safety** bölümünde şunları işaretlerken kullan:

#### A) Data collection (Toplama)
- **Evet** (hesap/ilan/mesaj/fatura gibi özellikler nedeniyle)

Önerilen kategoriler:
- **Personal info**
  - Email address (Evet)
  - Name (Opsiyonel/Evet)
  - Phone number (Opsiyonel/Evet)
  - Other info (ör: profil fotoğrafı / opsiyonel)
- **Location**
  - Precise / Approximate location (Hayır — GPS konumu toplanmıyor)
  - Other location info (Evet — “location” metin alanı ilan/hesap içinde)
- **Messages**
  - Other user-to-user messages (Evet — mesajlaşma varsa)
- **Photos and videos**
  - Photos (Evet — ilan fotoğrafları)
- **Financial info**
  - Purchases / Payment info (Dikkat)
    - Kart bilgisi uygulama tarafından saklanmıyorsa “Payment info” genelde Hayır seçilir.
    - Premium/abonelik satışı varsa “Purchases” (Evet) seçilebilir.
  - Other financial info (Evet — fatura alanları kullanılıyorsa)
- **App activity**
  - Other actions / In-app search / Page views (varsa Evet; yoksa Hayır)
- **Device or other IDs**
  - Device or other IDs (genelde Hayır; analytics SDK yoksa)
  - (Oturum/cookie token’ları web tarafında olabilir; Play Console yorumuna göre değerlendir)

#### B) Data usage (Kullanım amacı)
Tipik işaretlenecek amaçlar:
- **App functionality**: hesap yönetimi, ilan yönetimi, mesajlaşma, faturalama
- **Fraud prevention, security, and compliance**: rate limit / abuse önleme
- **Analytics**: yalnızca gerçek analytics kullanıyorsanız
- **Advertising**: yalnızca reklam sistemi varsa

#### C) Data sharing (Paylaşım)
- **Genelde Hayır**: Üçüncü taraflara veri satma/paylaşma yoksa.
- **İstisna**: Ödeme akışında PayTR gibi bir ödeme sağlayıcı kullanılıyorsa, ödeme sırasında kullanıcı PayTR ile etkileşir.
  - Kart verisini uygulama tutmuyorsa bunu açıklama alanında belirt.

#### D) Security practices
- **Data encrypted in transit**: Evet (HTTPS)
- **Data deletion**: Hesap silme/iletişim süreci nasıl ise onu ekleyin (örn. destek@alo17.tr üzerinden talep)

### 5) Gizlilik politikası URL
- `https://alo17.tr/gizlilik`

### 6) İletişim
- destek@alo17.tr

