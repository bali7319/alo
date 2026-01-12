# Android APK Build Script for alo17.tr
# Bu script Android APK oluşturmak için gerekli adımları yürütür

Write-Host "=== alo17.tr Android APK Build Script ===" -ForegroundColor Cyan

# 1. Capacitor sync
Write-Host "`n[1/3] Capacitor sync yapılıyor..." -ForegroundColor Yellow
npx cap sync

if ($LASTEXITCODE -ne 0) {
    Write-Host "Hata: Capacitor sync başarısız!" -ForegroundColor Red
    exit 1
}

# 2. Android Studio'yu aç veya build komutu ver
Write-Host "`n[2/3] Android projesi hazır!" -ForegroundColor Green
Write-Host "`nAPK oluşturmak için iki seçenek var:" -ForegroundColor Cyan
Write-Host "`nSeçenek 1: Android Studio ile (Önerilen)" -ForegroundColor Yellow
Write-Host "  Komut: npm run mobile:android" -ForegroundColor White
Write-Host "  Android Studio açıldıktan sonra:" -ForegroundColor White
Write-Host "  - Build > Build Bundle(s) / APK(s) > Build APK(s)" -ForegroundColor White
Write-Host "  - APK dosyası: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor White

Write-Host "`nSeçenek 2: Gradle ile komut satırından" -ForegroundColor Yellow
Write-Host "  cd android" -ForegroundColor White
Write-Host "  .\gradlew assembleDebug" -ForegroundColor White
Write-Host "  APK dosyası: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor White

Write-Host "`n[3/3] Production APK için:" -ForegroundColor Cyan
Write-Host "  - Keystore oluşturun (ilk kez)" -ForegroundColor White
Write-Host "  - capacitor.config.ts'de keystorePath ve keystoreAlias ayarlayın" -ForegroundColor White
Write-Host "  - .\gradlew assembleRelease" -ForegroundColor White

Write-Host "`n=== Tamamlandı! ===" -ForegroundColor Green
