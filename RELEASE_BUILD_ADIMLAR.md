# Release Build Adımları - Android Studio

## ADIM 2: Release APK/AAB Oluşturma

### Android Studio'dan (Önerilen)

1. **Android Studio'yu açın**
   - Proje zaten açık olmalı: `C:\Users\bali\Desktop\alo\android`

2. **Build menüsünden:**
   - **Build** > **Generate Signed Bundle / APK**
   - Veya: **Build** > **Build Bundle(s) / APK(s)** > **Build Bundle(s)**

3. **Bundle/APK seçimi:**
   - **Android App Bundle** seçin (önerilir - daha küçük boyut)
   - Veya **APK** seçin (daha kolay test)

4. **Keystore bilgileri:**
   - **Key store path**: `C:\Users\bali\Desktop\alo\keystore\alo17-release-key.jks`
     - **Browse** butonuna tıklayıp dosyayı seçin
   - **Key store password**: Keystore oluştururken girdiğiniz şifre
   - **Key alias**: `alo17`
   - **Key password**: Key şifreniz (genellikle keystore şifresiyle aynı)
   - **Next** tıklayın

5. **Build variant:**
   - **release** seçin
   - **Signature Versions**: V1 ve V2 işaretli olsun
   - **Finish** tıklayın

6. **Build tamamlandıktan sonra:**
   - AAB: `android\app\build\outputs\bundle\release\app-release.aab`
   - APK: `android\app\build\outputs\apk\release\app-release.apk`
   - Android Studio bildirim gösterecek: "APK(s) generated successfully"
   - **locate** linkine tıklayarak dosyayı bulabilirsiniz

---

## Alternatif: Komut Satırından

**Not:** Komut satırından yapmak için release imzalama gerekir. Şifreleri repoya yazmayın:
- `android/gradle-release.properties.example` dosyasını `android/gradle-release.properties` olarak kopyalayın
- `RELEASE_STORE_PASSWORD` ve `RELEASE_KEY_PASSWORD` alanlarını doldurun

Android Studio'dan imzalı AAB üretmek genellikle daha güvenlidir.

```powershell
cd C:\Users\bali\Desktop\alo\android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# AAB için
.\gradlew bundleRelease

# APK için
.\gradlew assembleRelease
```

---

## Sonraki Adım

Release APK/AAB oluşturulduktan sonra:
- **ADIM 3**: Google Play Console'a yükleme
- Detaylar: `PLAY_STORE_ADIMLAR.md`

---

## Önemli Notlar

- ✅ Keystore şifresini kaybetmeyin!
- ✅ Release build'i test edin (emulator'de)
- ✅ AAB önerilir (daha küçük, Google Play tarafından optimize edilir)
- ✅ APK daha kolay test edilir
