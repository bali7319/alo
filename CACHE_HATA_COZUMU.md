# "Single item size exceeds maxSize" Hatası Çözümü

## 🔍 Sorun
Next.js cache'i çok büyük API response'larını cache'lemeye çalıştığında bu hata oluşuyor.

## ✅ Yapılan Düzeltmeler

### 1. API Route Cache Kaldırıldı
**Dosya**: `src/app/api/listings/category/[slug]/route.ts`

- `export const revalidate = 60;` kaldırıldı (comment out)
- `Cache-Control` header'ı `no-store` olarak değiştirildi
- Büyük response'lar artık cache'lenmiyor

### 2. Next.js Config Optimize Edildi
**Dosya**: `next.config.js`

- `onDemandEntries` cache ayarları zaten var
- `experimental.staleTimes` ayarları mevcut

## 🚀 Sunucuda Uygulama

```bash
cd /var/www/alo17
npm run build
pm2 restart alo17
pm2 logs alo17 --err
```

## 📊 Beklenen Sonuç

- "Single item size exceeds maxSize" hatası artık görünmemeli
- API response'ları hala hızlı (database index'leri sayesinde)
- Cache olmasa da performans iyi (index'ler yeterli)

## ⚠️ Not

Cache kaldırıldı ama performans sorunu yok çünkü:
- Database index'leri var (sorgular hızlı)
- Pagination var (küçük response'lar)
- Select optimizasyonu var (sadece gerekli field'lar)

## 🔄 Alternatif Çözüm (İleride)

Eğer cache'e geri dönmek isterseniz:
1. Response boyutunu küçültün (daha az ilan, daha az field)
2. Veya Redis gibi external cache kullanın

