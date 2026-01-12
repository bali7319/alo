# Android APK Oluşturma Rehberi - alo17.tr

Bu rehber, alo17.tr uygulaması için Android APK oluşturma adımlarını içerir.

## Gereksinimler

1. **Node.js** (zaten yüklü)
2. **Android Studio** veya **Android SDK**
3. **Java JDK** (Android Studio ile birlikte gelir)

## Hızlı Başlangıç

### 1. Android Studio Kurulumu

Android Studio'yu [developer.android.com/studio](https://developer.android.com/studio) adresinden indirip kurun.

### 2. APK Oluşturma

#### Yöntem 1: Build Script ile (Önerilen)

```powershell
.\build-android.ps1
npm run mobile:android
```

Android Studio açıldıktan sonra:
- **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
- APK dosyası: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Yöntem 2: Gradle ile Komut Satırından

```powershell
cd android
.\gradlew assembleDebug
```

APK dosyası: `android/app/build/outputs/apk/debug/app-debug.apk`

## Yapılandırma

### Production URL

Uygulama şu anda `https://alo17.tr` adresine bağlanacak şekilde yapılandırılmıştır.

`capacitor.config.ts` dosyasında URL'yi değiştirebilirsiniz:

```typescript
server: {
  url: 'https://alo17.tr', // Production URL
  // url: 'http://localhost:3000', // Development için
}
```

### Uygulama Bilgileri

- **App ID**: `com.alo17.tr`
- **App Name**: `alo17`
- **Package Name**: `com.alo17.tr`

Bu bilgileri değiştirmek için `capacitor.config.ts` dosyasını düzenleyin.

## Production APK (Play Store için)

### 1. Keystore Oluşturma

```powershell
keytool -genkey -v -keystore alo17-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias alo17
```

### 2. Keystore Bilgilerini Yapılandırma

`capacitor.config.ts` dosyasını güncelleyin:

```typescript
android: {
  buildOptions: {
    keystorePath: '../alo17-release-key.jks',
    keystoreAlias: 'alo17',
  }
}
```

### 3. Release APK Oluşturma

```powershell
cd android
.\gradlew assembleRelease
```

APK dosyası: `android/app/build/outputs/apk/release/app-release.apk`

## Sorun Giderme

### "out directory missing" Hatası

Bu normaldir. Uygulama production URL'den yükleneceği için `out` klasörüne gerek yoktur.

### Android Studio Açılmıyor

```powershell
npm run mobile:android
```

komutu çalışmıyorsa, Android Studio'yu manuel olarak açın ve `android` klasörünü proje olarak açın.

### Gradle Build Hatası

```powershell
cd android
.\gradlew clean
.\gradlew assembleDebug
```

### Capacitor Sync Hatası

```powershell
npm run mobile:sync
```

## Notlar

- Uygulama şu anda production URL'ye bağlanacak şekilde yapılandırılmıştır
- Offline çalışma için static export gerekir (Next.js 15 App Router ile sınırlı)
- İlk build biraz zaman alabilir (dependencies indirilir)

## Destek

Sorun yaşarsanız:
1. `npm run mobile:sync` komutunu çalıştırın
2. Android Studio'da **File** > **Invalidate Caches / Restart** yapın
3. `android` klasörünü silip `npx cap add android` komutunu tekrar çalıştırın
