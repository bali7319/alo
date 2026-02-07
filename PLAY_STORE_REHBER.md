# Google Play Store'a Yükleme Rehberi - alo17.tr

Bu rehber, alo17.tr uygulamasını Google Play Store'a yükleme adımlarını içerir.

## Gereksinimler

1. **Google Play Console Hesabı** (25$ tek seferlik ücret)
2. **Keystore Dosyası** (Uygulamayı imzalamak için)
3. **Release APK veya AAB** (Android App Bundle önerilir)

## Adım 1: Keystore Oluşturma

### Windows PowerShell'de:

```powershell
cd C:\Users\bali\Desktop\alo\android
keytool -genkey -v -keystore alo17-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias alo17
```

**Önemli Bilgiler:**
- **Keystore Password**: Güçlü bir şifre seçin ve kaydedin!
- **Key Password**: Keystore şifresiyle aynı olabilir
- **İsim**: Alo17 veya şirket adınız
- **Organizasyon Birimi**: (opsiyonel)
- **Organizasyon**: Şirket adınız
- **Şehir**: Şehir adı
- **Eyalet**: Eyalet adı
- **Ülke Kodu**: TR (Türkiye için)

**⚠️ UYARI:** Keystore dosyasını ve şifresini kaybetmeyin! Kaybederseniz uygulamanızı güncelleyemezsiniz!

### Keystore'u Güvenli Yerde Saklayın

```powershell
# Keystore dosyasını güvenli bir yere kopyalayın
Copy-Item alo17-release-key.jks "C:\Users\bali\Desktop\alo\keystore\alo17-release-key.jks"
```

## Adım 2: Capacitor Config Güncelleme

`capacitor.config.ts` dosyasını güncelleyin:

```typescript
android: {
  buildOptions: {
    keystorePath: '../keystore/alo17-release-key.jks',
    keystoreAlias: 'alo17',
    keystorePassword: 'KEYSTORE_SIFRENIZ', // Güvenlik için .env kullanın
    keystoreType: 'jks'
  }
}
```

**Güvenlik İçin:** Şifreyi `.env` dosyasına ekleyin ve `capacitor.config.ts`'de okuyun.

## Adım 3: Release APK Oluşturma

### Yöntem 1: Android Studio'dan

1. Android Studio'yu açın
2. **Build** > **Generate Signed Bundle / APK**
3. **Android App Bundle** seçin (önerilir) veya **APK**
4. Keystore bilgilerini girin
5. **release** build variant'ını seçin
6. **Finish** ile build'i başlatın

### Yöntem 2: Komut Satırından

```powershell
cd C:\Users\bali\Desktop\alo\android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
.\gradlew bundleRelease
```

APK için:
```powershell
.\gradlew assembleRelease
```

**Çıktı:**
- AAB: `app\build\outputs\bundle\release\app-release.aab`
- APK: `app\build\outputs\apk\release\app-release.apk`

## Adım 4: Google Play Console Hesabı Oluşturma

1. [Google Play Console](https://play.google.com/console) adresine gidin
2. Google hesabınızla giriş yapın
3. **25$ tek seferlik ücret** ödeyin
4. Geliştirici hesabınızı oluşturun

## Adım 5: Uygulamayı Play Console'a Yükleme

### 5.1. Yeni Uygulama Oluşturma

1. Play Console'da **Uygulama oluştur** butonuna tıklayın
2. **Uygulama adı**: alo17
3. **Varsayılan dil**: Türkçe
4. **Uygulama türü**: Uygulama
5. **Ücretsiz mi, ücretli mi?**: Ücretsiz
6. **Gizlilik politikası**: `https://alo17.tr/gizlilik`
7. **Oluştur** butonuna tıklayın

### 5.2. Uygulama Bilgilerini Doldurma

**Mağaza ayarları:**
- **Kısa açıklama**: "Çanakkale'nin en büyük ilan sitesi"
- **Tam açıklama**: Uygulamanın detaylı açıklaması
- **Ekran görüntüleri**: En az 2 adet (telefon için)
- **Yüksek performanslı simge**: 512x512 PNG
- **Özellik grafiği**: 1024x500 PNG (opsiyonel)

**Kategori:**
- **Uygulama kategorisi**: Alışveriş veya Yaşam Tarzı
- **İçerik derecelendirmesi**: PEGI, ESRB veya diğer

### 5.3. APK/AAB Yükleme

1. Sol menüden **Üretim** > **Yeni sürüm oluştur** seçin
2. **Uygulama paketini yükle** butonuna tıklayın
3. `app-release.aab` veya `app-release.apk` dosyasını seçin
4. **Sürüm adı**: 1.0.0
5. **Sürüm notları**: İlk sürüm notları
6. **Kaydet** butonuna tıklayın

### 5.4. İçerik Derecelendirmesi

1. **İçerik derecelendirmesi** bölümüne gidin
2. Anketi doldurun
3. Derecelendirmeyi alın

### 5.5. Gizlilik ve Güvenlik

1. **Gizlilik politikası URL**: `https://alo17.tr/gizlilik`
2. **Veri güvenliği**: Uygulamanın topladığı verileri belirtin
3. **Uygulama erişimi**: Gerekli izinleri açıklayın

## Adım 6: Yayınlama

1. Tüm bölümleri tamamlayın (yeşil tik işaretleri)
2. **Gözden geçirme için gönder** butonuna tıklayın
3. Google incelemesi 1-3 gün sürebilir
4. Onaylandıktan sonra uygulama Play Store'da görünecek

## Önemli Notlar

### Keystore Güvenliği
- Keystore dosyasını ve şifresini **kesinlikle kaybetmeyin**
- Güvenli bir yerde yedekleyin (bulut + yerel)
- Şifreyi güvenli bir şifre yöneticisinde saklayın

### Sürüm Yönetimi
- Her yeni sürüm için **versionCode** artırın
- **versionName** anlamlı olsun (1.0.0, 1.1.0, vb.)

### Test
- **Internal testing** ile önce test edin
- **Closed testing** ile beta test yapın
- **Open testing** ile geniş kitleye açın
- Son olarak **Production**'a yayınlayın

## Sorun Giderme

### Keystore Hatası
```powershell
# Keystore bilgilerini kontrol edin
keytool -list -v -keystore alo17-release-key.jks
```

### Build Hatası
```powershell
# Temiz build yapın
cd android
.\gradlew clean
.\gradlew bundleRelease
```

### Play Console Hataları
- Tüm zorunlu alanları doldurun
- Ekran görüntüleri doğru boyutlarda olsun
- Gizlilik politikası URL'i erişilebilir olsun

## Hızlı Komutlar

```powershell
# Keystore oluştur
cd android
keytool -genkey -v -keystore alo17-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias alo17

# Release AAB oluştur
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
.\gradlew bundleRelease

# Release APK oluştur
.\gradlew assembleRelease
```

## Destek

Sorun yaşarsanız:
- [Google Play Console Yardım](https://support.google.com/googleplay/android-developer)
- [Android Developer Dokümantasyonu](https://developer.android.com)
