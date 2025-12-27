# 🚨 Acil: API Route Deploy ve Cache Temizleme

## 🔍 Sorun

- `/ilanlar` sayfasında "Örnek İlan"lar görünüyor
- Ctrl+Shift+R yapıldı ama hala görünüyor
- API route'u henüz deploy edilmemiş veya cache sorunu var

## ✅ Çözüm: Tam Deploy ve Cache Temizleme

### Tek Komut (PowerShell)

```powershell
cd C:\Users\bali\Desktop\alo; scp src/app/api/listings/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/route.ts; ssh root@alo17.tr "cd /var/www/alo17 && rm -rf .next && npm run build && pm2 restart alo17 && pm2 flush && curl -s http://localhost:3000/api/listings?page=1&limit=5 | head -c 500"
```

### Adım Adım

1. **API route'unu deploy et:**
```powershell
cd C:\Users\bali\Desktop\alo
scp src/app/api/listings/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/route.ts
```

2. **Sunucuda build ve restart:**
```bash
ssh root@alo17.tr
cd /var/www/alo17
rm -rf .next
npm run build
pm2 restart alo17
pm2 flush
```

3. **API'yi test et:**
```bash
curl http://localhost:3000/api/listings?page=1&limit=5
```

## 🔍 Kontrol

Deploy sonrası:
1. Tarayıcı cache'ini temizle (Ctrl+Shift+Delete → "Cached images and files")
2. Gizli modda test et (Ctrl+Shift+N)
3. `/ilanlar` sayfasını aç
4. Developer Tools → Network → `/api/listings` isteğini kontrol et

## ✅ Beklenen Sonuç

- API'den 0 ilan dönmeli (admin filtresi çalışıyor)
- `/ilanlar` sayfasında "Henüz ilan bulunmamaktadır" mesajı görünmeli
- "Örnek İlan"lar kaybolmalı

