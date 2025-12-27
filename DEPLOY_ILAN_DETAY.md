# 🚀 İlan Detay Sayfası Deploy

## ✅ Optimizasyonlar Tamamlandı

1. `generateMetadata`: 500 ilan → 50 ilan
2. Fallback: Tüm ilanlar → 50 ilan  
3. Arama stratejisi: Slug'dan kelime çıkarıp title'da arama
4. Timeout: 3-5s

## 📋 Deploy Komutları

### Tek Komut (PowerShell)

```powershell
cd C:\Users\bali\Desktop\alo; scp "src/app/ilan/[id]/page.tsx" root@alo17.tr:/var/www/alo17/src/app/ilan/[id]/page.tsx; ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart alo17"
```

### Adım Adım

1. **Dosyayı transfer et:**
```powershell
cd C:\Users\bali\Desktop\alo
scp "src/app/ilan/[id]/page.tsx" root@alo17.tr:/var/www/alo17/src/app/ilan/[id]/page.tsx
```

2. **Sunucuda restart:**
```bash
ssh root@alo17.tr
cd /var/www/alo17
pm2 restart alo17
```

## ✅ Beklenen Sonuç

- İlan detay sayfası daha hızlı açılacak
- `generateMetadata` daha hızlı çalışacak (50 ilan yerine 500)
- Fallback daha hızlı (50 ilan yerine tüm ilanlar)

## 🔍 Test

1. `https://alo17.tr/ilan/kiralik-mobil-jenerator-kesintisiz-enerji-cozumleri` sayfasını aç
2. Sayfa yükleme süresini kontrol et
3. Developer Tools → Network → Response sürelerini kontrol et

