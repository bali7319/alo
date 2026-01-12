# APK Test Script
Write-Host "=== APK Test Script ===" -ForegroundColor Cyan

$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"

# APK kontrolü
if (-not (Test-Path $apkPath)) {
    Write-Host "Hata: APK bulunamadi!" -ForegroundColor Red
    Write-Host "Once APK olusturun: npm run mobile:apk" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nAPK bulundu: $apkPath" -ForegroundColor Green

# ADB kontrolü
$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adbPath)) {
    Write-Host "`nHata: ADB bulunamadi!" -ForegroundColor Red
    Write-Host "Android SDK Platform-Tools kurulu olmali." -ForegroundColor Yellow
    exit 1
}

Write-Host "ADB bulundu: $adbPath" -ForegroundColor Green

# Cihaz kontrolü
Write-Host "`nBagli cihazlar kontrol ediliyor..." -ForegroundColor Yellow
& $adbPath devices

Write-Host "`n=== Kullanim ===" -ForegroundColor Cyan
Write-Host "1. Android Studio'da emulator baslatin" -ForegroundColor White
Write-Host "2. Emulator acildiktan sonra bu script'i tekrar calistirin" -ForegroundColor White
Write-Host "`nVeya manuel olarak:" -ForegroundColor Yellow
Write-Host "  adb install $apkPath" -ForegroundColor White

# Cihaz varsa otomatik yükle
$devices = & $adbPath devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$" }
if ($devices) {
    Write-Host "`nCihaz bulundu! APK yukleniyor..." -ForegroundColor Green
    & $adbPath install -r $apkPath
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nAPK basariyla yuklendi!" -ForegroundColor Green
        Write-Host "Uygulama aciliyor..." -ForegroundColor Cyan
        & $adbPath shell am start -n com.alo17.tr/.MainActivity
        Write-Host "`nUygulama emulator'de acildi!" -ForegroundColor Green
    } else {
        Write-Host "`nHata: APK yuklenemedi!" -ForegroundColor Red
    }
} else {
    Write-Host "`nUyari: Bagli cihaz/emulator bulunamadi!" -ForegroundColor Yellow
    Write-Host "Lutfen emulator'u baslatin veya cihaz baglayin." -ForegroundColor White
}
