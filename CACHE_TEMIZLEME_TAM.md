# 🧹 Cache Temizleme - Tam Temizlik

## 🔍 Sorun

Log'larda hala "Single item size exceeds maxSize" hataları görünüyor. Bu eski cache'lenmiş verilerden kaynaklanıyor olabilir.

## ✅ Tam Cache Temizleme

### Sunucuda Çalıştırın:

```bash
cd /var/www/alo17

# 1. Next.js cache'ini temizle
rm -rf .next/cache
rm -rf .next

# 2. Node modules cache'ini temizle (opsiyonel)
rm -rf node_modules/.cache

# 3. PM2 log'larını temizle
pm2 flush

# 4. Build
npm run build

# 5. Restart
pm2 restart alo17

# 6. Log'ları kontrol et
pm2 logs alo17 --err --lines 20
```

## 🔍 Mevcut Resimleri Kontrol Et

```bash
cd /var/www/alo17
node scripts/optimize-existing-images.js
```

Bu script:
- Tüm aktif ilanları kontrol eder
- Büyük resimleri tespit eder
- Sadece log tutar (değişiklik yapmaz)

## ⚠️ Not

- Mevcut resimler optimize edilmeyecek (sadece yeni yüklenenler)
- "Single item size exceeds maxSize" hatası eski ilanlar için devam edebilir
- Bu hatalar kritik değil - sayfa çalışmaya devam eder
- Yeni ilanlar için sorun çözülecek

## ✅ Beklenen Sonuç

- Cache temizlendikten sonra yeni hatalar azalacak
- Eski hatalar log'da kalacak ama yeni hatalar gelmeyecek
- Yeni ilanlar optimize edilecek

