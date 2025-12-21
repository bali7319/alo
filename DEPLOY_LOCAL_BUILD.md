# Yerel Build ve Sunucuya Aktarma

## 1. Yerel Build Yap
```powershell
cd C:\Users\bali\Desktop\alo
npm install
npm run build
```

## 2. .next Klasörünü ZIP'le
```powershell
# Eski ZIP'i sil
if (Test-Path .next.zip) { Remove-Item .next.zip }

# Yeni ZIP oluştur
Compress-Archive -Path .next -DestinationPath .next.zip -Force

# Boyutu kontrol et
$size = (Get-Item .next.zip).Length / 1MB
Write-Host "ZIP boyutu: $([math]::Round($size, 2)) MB"
```

## 3. WinSCP ile Sunucuya Aktar
- WinSCP'yi açın
- `alo17.tr` sunucusuna bağlanın
- `.next.zip` dosyasını `/var/www/alo17/` klasörüne yükleyin

## 4. Sunucuda Aç ve Deploy Et
```bash
cd /var/www/alo17

# Eski .next klasörünü yedekle
mv .next .next.old 2>/dev/null || true

# Yeni ZIP'i aç
unzip -o .next.zip

# İzinleri düzelt
chmod -R 755 .next

# PM2'yi yeniden başlat
pm2 restart alo17
pm2 save
pm2 status
```

