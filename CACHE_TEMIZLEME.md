# Cache Temizleme - "Örnek İlan" Sorunu

## 🔍 Sorun

Database'de sadece 2 aktif ilan var ama ekranda çok fazla "Örnek İlan" görünüyor. Bu cache sorunu!

## ✅ Çözüm: Tüm Cache'leri Temizle

### 1. Sunucuda Build Cache ve Restart

```bash
ssh root@alo17.tr
cd /var/www/alo17

# Build cache'i temizle
rm -rf .next

# Build al
npm run build

# PM2 restart
pm2 restart alo17

# Logları kontrol et
pm2 logs alo17 --lines 50
```

### 2. API Route'unu Kontrol Et

`/api/listings` route'unda admin filtresi var mı kontrol et:

```bash
grep -A 10 "adminUser" src/app/api/listings/route.ts
```

Eğer yoksa, dosyayı güncelle ve deploy et.

### 3. Browser Cache Temizle

**Tarayıcıda:**
1. F12 (Developer Tools) aç
2. Network tab'ına git
3. "Disable cache" işaretle
4. Sayfayı yenile (Ctrl+Shift+R veya Ctrl+F5)
5. Veya gizli modda test et

### 4. Nginx Cache Temizle (Eğer varsa)

```bash
# Nginx cache dizinini temizle
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

## 🎯 Beklenen Sonuç

- Sadece 2 gerçek ilan görünecek
- "Örnek İlan"lar kaybolacak
- Admin ilanları filtrelenecek
