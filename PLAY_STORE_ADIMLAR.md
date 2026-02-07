# Google Play Store'a Yükleme - Adım Adım Rehber

## ADIM 1: Keystore Oluşturma ✅

### 1.1. Keystore Oluştur

**Windows'ta:**
1. `android` klasörüne gidin
2. `keystore-olustur.bat` dosyasına çift tıklayın
3. Veya PowerShell'de:
   ```powershell
   cd C:\Users\bali\Desktop\alo\android
   .\keystore-olustur.bat
   ```

**Manuel olarak:**
```powershell
cd C:\Users\bali\Desktop\alo\android
"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkey -v -keystore alo17-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias alo17
```

**Gireceğiniz bilgiler:**
- **Keystore password**: En az 6 karakter (ÖRNEK: `Alo17Release2026!`)
- **Key password**: Aynı şifre veya Enter
- **İsim**: `Alo17`
- **Organizasyon Birimi**: (Enter'a basabilirsiniz)
- **Organizasyon**: `Alo17` veya şirket adınız
- **Şehir**: `Çanakkale` veya şehriniz
- **Eyalet**: (Enter'a basabilirsiniz)
- **Ülke kodu**: `TR`

**⚠️ ÇOK ÖNEMLİ:** Keystore şifresini ve dosyasını kaydetmeyin! Kaybederseniz uygulamanızı güncelleyemezsiniz!

### 1.2. Keystore'u Güvenli Yerde Saklayın

```powershell
# Güvenli bir klasör oluşturun
New-Item -ItemType Directory -Force -Path "C:\Users\bali\Desktop\alo\keystore"
Copy-Item "C:\Users\bali\Desktop\alo\android\alo17-release-key.jks" "C:\Users\bali\Desktop\alo\keystore\"
```

---

## ADIM 2: Capacitor Config Güncelleme

`capacitor.config.ts` dosyasını güncelleyin:

```typescript
android: {
  buildOptions: {
    keystorePath: '../keystore/alo17-release-key.jks',
    keystoreAlias: 'alo17',
    // Şifreyi buraya yazmayın! Android Studio'da gireceksiniz
  }
}
```

> Alternatif (önerilen): Komut satırından **güvenli release imzalama** için
> `android/gradle-release.properties.example` dosyasını `android/gradle-release.properties` olarak kopyalayın ve
> `RELEASE_STORE_PASSWORD` / `RELEASE_KEY_PASSWORD` değerlerini doldurun. Bu dosya repoya eklenmez (gitignore).

---

## ADIM 3: Release APK/AAB Oluşturma

### 3.1. Android Studio'dan (Önerilen)

1. Android Studio'yu açın
2. **Build** > **Generate Signed Bundle / APK**
3. **Android App Bundle** seçin (önerilir) veya **APK**
4. **Next** tıklayın
5. **Key store path**: `C:\Users\bali\Desktop\alo\keystore\alo17-release-key.jks`
6. **Key store password**: Keystore şifrenizi girin
7. **Key alias**: `alo17`
8. **Key password**: Key şifrenizi girin
9. **Next** tıklayın
10. **release** seçin
11. **Finish** tıklayın

**Çıktı:**
- AAB: `android\app\build\outputs\bundle\release\app-release.aab`
- APK: `android\app\build\outputs\apk\release\app-release.apk`

### 3.2. Komut Satırından

```powershell
cd C:\Users\bali\Desktop\alo\android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# AAB için (önerilir)
.\gradlew bundleRelease

# APK için
.\gradlew assembleRelease
```

**Not:** Komut satırından yaparsanız şifreleri `gradle.properties` dosyasına eklemeniz gerekir (güvenli değil).

---

## ADIM 4: Google Play Console Hesabı

1. [Google Play Console](https://play.google.com/console) adresine gidin
2. Google hesabınızla giriş yapın
3. **25$ tek seferlik ücret** ödeyin
4. Geliştirici hesabınızı oluşturun

---

## ADIM 5: Uygulamayı Play Console'a Yükleme

### 5.1. Yeni Uygulama Oluştur

1. Play Console'da **Uygulama oluştur** butonuna tıklayın
2. **Uygulama adı**: `alo17`
3. **Varsayılan dil**: `Türkçe`
4. **Uygulama türü**: `Uygulama`
5. **Ücretsiz mi, ücretli mi?**: `Ücretsiz`
6. **Gizlilik politikası**: `https://alo17.tr/gizlilik`
7. **Oluştur** butonuna tıklayın

### 5.2. Mağaza Ayarları

**Gerekli bilgiler:**
- **Kısa açıklama** (80 karakter): "Çanakkale'nin en büyük ilan sitesi"
- **Tam açıklama** (4000 karakter): Uygulamanın detaylı açıklaması
- **Ekran görüntüleri**: En az 2 adet (telefon için)
  - Boyut: 16:9 veya 9:16
  - Format: PNG veya JPEG
- **Yüksek performanslı simge**: 512x512 PNG
- **Uygulama kategorisi**: `Alışveriş` veya `Yaşam Tarzı`

### 5.3. APK/AAB Yükleme

1. Sol menüden **Üretim** > **Yeni sürüm oluştur**
2. **Uygulama paketini yükle** butonuna tıklayın
3. `app-release.aab` veya `app-release.apk` dosyasını seçin
4. **Sürüm adı**: `1.0.0`
5. **Sürüm notları**: 
   ```
   İlk sürüm
   - Ücretsiz ilan verme
   - İlan arama ve filtreleme
   - Kategori bazlı ilan görüntüleme
   ```
6. **Kaydet** butonuna tıklayın

### 5.4. İçerik Derecelendirmesi

1. **İçerik derecelendirmesi** bölümüne gidin
2. Anketi doldurun (genellikle "Herkes" seviyesi)
3. Derecelendirmeyi alın

### 5.5. Gizlilik ve Güvenlik

1. **Gizlilik politikası URL**: `https://alo17.tr/gizlilik`
2. **Veri güvenliği**: Uygulamanın topladığı verileri belirtin
3. **Uygulama erişimi**: Gerekli izinleri açıklayın

---

## ADIM 6: Yayınlama

1. Tüm bölümleri tamamlayın (yeşil tik işaretleri)
2. **Gözden geçirme için gönder** butonuna tıklayın
3. Google incelemesi **1-3 gün** sürebilir
4. Onaylandıktan sonra uygulama Play Store'da görünecek

---

## Önemli Notlar

### Keystore Güvenliği
- ✅ Keystore dosyasını **yedekleyin** (bulut + yerel)
- ✅ Şifreyi **güvenli bir yerde saklayın**
- ❌ Keystore'u **kaybetmeyin** (uygulama güncellemesi yapamazsınız)

### Sürüm Yönetimi
- Her yeni sürüm için `versionCode` artırın
- `versionName` anlamlı olsun: `1.0.0`, `1.1.0`, `2.0.0`

### Test Stratejisi
1. **Internal testing** - İç test
2. **Closed testing** - Beta test
3. **Open testing** - Geniş beta
4. **Production** - Yayın

---

## Hızlı Başlangıç Komutları

```powershell
# 1. Keystore oluştur
cd C:\Users\bali\Desktop\alo\android
.\keystore-olustur.bat

# 2. Release AAB oluştur (Android Studio'dan önerilir)
# Build > Generate Signed Bundle / APK

# 3. AAB dosyası konumu (Play Store)
# android\app\build\outputs\bundle\release\app-release.aab
```

---

## Sorun Giderme

### Keystore Hatası
```powershell
# Keystore bilgilerini kontrol et
"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -list -v -keystore alo17-release-key.jks
```

### Build Hatası
```powershell
# Temiz build
cd android
.\gradlew clean
.\gradlew bundleRelease
```

---

**Hazır olduğunuzda ADIM 1'den başlayın!** 🚀
