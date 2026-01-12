# Android SDK Sorununu Düzeltme Script'i
Write-Host "=== Android SDK Sorununu Düzeltme ===" -ForegroundColor Cyan

# 1. local.properties kontrolü
Write-Host "`n[1/4] local.properties kontrol ediliyor..." -ForegroundColor Yellow
$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
$localProps = "local.properties"

if (Test-Path $localProps) {
    $content = Get-Content $localProps -Raw
    if ($content -match "sdk\.dir") {
        Write-Host "✓ local.properties mevcut ve SDK path ayarlı" -ForegroundColor Green
    } else {
        Write-Host "✗ local.properties'de SDK path bulunamadı, ekleniyor..." -ForegroundColor Red
        Add-Content -Path $localProps -Value "`nsdk.dir=$sdkPath"
    }
} else {
    Write-Host "✗ local.properties bulunamadı, oluşturuluyor..." -ForegroundColor Red
    @"
## This file must *NOT* be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
sdk.dir=$sdkPath
"@ | Out-File -FilePath $localProps -Encoding UTF8
}

# 2. Gradle cache temizleme
Write-Host "`n[2/4] Gradle cache temizleniyor..." -ForegroundColor Yellow
if (Test-Path ".gradle") {
    Remove-Item -Path ".gradle" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Gradle cache temizlendi" -ForegroundColor Green
} else {
    Write-Host "✓ Gradle cache zaten temiz" -ForegroundColor Green
}

# 3. Build klasörü temizleme
Write-Host "`n[3/4] Build klasörleri temizleniyor..." -ForegroundColor Yellow
if (Test-Path "app\build") {
    Remove-Item -Path "app\build" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Build klasörü temizlendi" -ForegroundColor Green
}

# 4. SDK path kontrolü
Write-Host "`n[4/4] SDK path kontrol ediliyor..." -ForegroundColor Yellow
if (Test-Path $sdkPath) {
    Write-Host "✓ SDK path mevcut: $sdkPath" -ForegroundColor Green
    
    # Platform kontrolü
    $platformsPath = Join-Path $sdkPath "platforms"
    if (Test-Path $platformsPath) {
        $platforms = Get-ChildItem $platformsPath -Directory
        if ($platforms.Count -gt 0) {
            Write-Host "✓ Android platform'lar bulundu:" -ForegroundColor Green
            $platforms | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Cyan }
        } else {
            Write-Host "✗ Platform klasörü boş! SDK Manager'dan platform kurmanız gerekiyor." -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Platforms klasörü bulunamadı! SDK Manager'dan platform kurmanız gerekiyor." -ForegroundColor Red
    }
} else {
    Write-Host "✗ SDK path bulunamadı: $sdkPath" -ForegroundColor Red
}

Write-Host "`n=== Tamamlandı! ===" -ForegroundColor Green
Write-Host "`nSimdi Android Studio'da:" -ForegroundColor Cyan
Write-Host "1. File > Invalidate Caches / Restart" -ForegroundColor White
Write-Host "2. File > Sync Project with Gradle Files" -ForegroundColor White
