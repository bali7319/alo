# 🚨 Acil Deploy - API Route

## 🔍 Sorun

- `/ilanlar` sayfasında "Örnek İlan"lar görünüyor
- `/admin/ilanlar` sayfasında görünmüyor (veritabanında yok)
- API route'u henüz deploy edilmemiş (admin filtresi)

## ✅ Çözüm: API Route'unu Deploy Et

### Tek Komut

```powershell
cd C:\Users\bali\Desktop\alo; scp src/app/api/listings/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/route.ts; ssh root@alo17.tr "cd /var/www/alo17 && rm -rf .next && npm run build && pm2 restart alo17 && pm2 flush"
```

### Adım Adım

1. **API route'unu aktar:**
```powershell
cd C:\Users\bali\Desktop\alo
scp src/app/api/listings/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/route.ts
```

2. **Build ve restart:**
```bash
ssh root@alo17.tr
cd /var/www/alo17
rm -rf .next
npm run build
pm2 restart alo17
pm2 flush  # PM2 log'larını temizle
```

## ✅ Sonuç

- Admin kullanıcısının ilanları filtrelenecek
- `/ilanlar` sayfasında 0 ilan görünecek (çünkü sadece admin'in 2 ilanı var)
- "Örnek İlan"lar kaybolacak (zaten database'de yok, cache'den geliyor)

## 🔍 Test

1. Tarayıcı cache'ini temizle (Ctrl+Shift+R)
2. `/ilanlar` sayfasını aç
3. Sadece gerçek ilanlar görünmeli (şu an 0 olabilir)

