# Google Play Console'a Yükleme - Son Adımlar

## ✅ TAMAMLANAN İŞLEMLER

1. ✅ Keystore oluşturuldu
2. ✅ Release AAB oluşturuldu
3. ✅ Dosya hazır: `android\app\build\outputs\bundle\release\app-release.aab`

> İpucu: Release imzalama için şifreleri repoya yazmayın. `android/gradle-release.properties.example` dosyasını
> `android/gradle-release.properties` olarak kopyalayıp doldurabilirsiniz (dosya gitignore).

## 📱 GOOGLE PLAY CONSOLE'A YÜKLEME

### ADIM 1: Google Play Console Hesabı

1. [Google Play Console](https://play.google.com/console) adresine gidin
2. Google hesabınızla giriş yapın
3. **25$ tek seferlik ücret** ödeyin (henüz ödemediyseniz)
4. Geliştirici hesabınızı oluşturun

### ADIM 2: Yeni Uygulama Oluştur

1. Play Console'da **"Uygulama oluştur"** butonuna tıklayın
2. **Uygulama adı**: `alo17`
3. **Varsayılan dil**: `Türkçe`
4. **Uygulama türü**: `Uygulama`
5. **Ücretsiz mi, ücretli mi?**: `Ücretsiz`
6. **Gizlilik politikası URL**: `https://alo17.tr/gizlilik`
7. **Oluştur** butonuna tıklayın

### ADIM 3: Mağaza Ayarları

**Gerekli bilgiler:**

1. **Kısa açıklama** (80 karakter):
   ```
   Çanakkale'nin en büyük ilan sitesi
   ```

2. **Tam açıklama** (4000 karakter):
   ```
   Alo17, Çanakkale'nin en büyük ve güvenilir ilan platformudur. 
   Ücretsiz ilan verin, ikinci el eşya alın-satın, iş ilanları bulun.
   
   Özellikler:
   - Ücretsiz ilan verme
   - Kategori bazlı arama
   - Detaylı ilan görüntüleme
   - Güvenli mesajlaşma
   - Premium ilan seçenekleri
   
   Kategoriler:
   - Elektronik
   - Giyim
   - Ev Eşyaları
   - Araç
   - Emlak
   - İş İlanları
   - Ve daha fazlası...
   ```

3. **Ekran görüntüleri**: En az 2 adet (telefon için)
   - Boyut: 16:9 veya 9:16
   - Format: PNG veya JPEG
   - Minimum: 320px, Maximum: 3840px

4. **Yüksek performanslı simge**: 512x512 PNG
   - Şeffaf arka plan olmamalı
   - Yuvarlatılmış köşeler olmamalı

5. **Uygulama kategorisi**: `Alışveriş` veya `Yaşam Tarzı`

### ADIM 4: AAB Yükleme

1. Sol menüden **"Üretim"** > **"Yeni sürüm oluştur"** seçin
2. **"Uygulama paketini yükle"** butonuna tıklayın
3. Şu dosyayı seçin:
   ```
   C:\Users\bali\Desktop\alo\android\app\build\outputs\bundle\release\app-release.aab
   ```
4. **Sürüm adı**: `1.0.0`
5. **Sürüm notları**: 
   ```
   İlk sürüm
   - Ücretsiz ilan verme
   - İlan arama ve filtreleme
   - Kategori bazlı ilan görüntüleme
   - Güvenli mesajlaşma
   ```

6. **Kaydet** butonuna tıklayın

### ADIM 5: İçerik Derecelendirmesi

1. **"İçerik derecelendirmesi"** bölümüne gidin
2. Anketi doldurun:
   - Genellikle "Herkes" seviyesi
   - Şiddet içerik yok
   - Cinsel içerik yok
   - Uyuşturucu içerik yok
3. Derecelendirmeyi alın

### ADIM 6: Gizlilik ve Güvenlik

1. **Gizlilik politikası URL**: `https://alo17.tr/gizlilik`
2. **Veri güvenliği**: Uygulamanın topladığı verileri belirtin
3. **Uygulama erişimi**: Gerekli izinleri açıklayın

### ADIM 7: Yayınlama

1. Tüm bölümleri tamamlayın (yeşil tik işaretleri)
2. **"Gözden geçirme için gönder"** butonuna tıklayın
3. Google incelemesi **1-3 gün** sürebilir
4. Onaylandıktan sonra uygulama Play Store'da görünecek

## 📋 ÖNEMLİ NOTLAR

### Keystore Güvenliği
- ✅ Keystore dosyasını **yedekleyin** (bulut + yerel)
- ✅ Şifreyi **güvenli bir yerde saklayın**
- ❌ Keystore'u **kaybetmeyin** (uygulama güncellemesi yapamazsınız)

### Sürüm Yönetimi
- Her yeni sürüm için `versionCode` artırın
- `versionName` anlamlı olsun: `1.0.0`, `1.1.0`, `2.0.0`

### Test Stratejisi
1. **Internal testing** - İç test (önerilir)
2. **Closed testing** - Beta test
3. **Open testing** - Geniş beta
4. **Production** - Yayın

## 🎉 TEBRİKLER!

Release AAB dosyanız hazır! Google Play Console'a yükleyebilirsiniz.

**Dosya konumu:**
```
C:\Users\bali\Desktop\alo\android\app\build\outputs\bundle\release\app-release.aab
```
