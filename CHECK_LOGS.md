# Site Sürekli Dönüyor - Hata Kontrolü

## Hemen Kontrol Edin:

### 1. PM2 Logları Kontrol
```bash
pm2 logs alo17 --lines 50
```

### 2. Browser Console Kontrol
- F12 tuşuna basın
- Console sekmesine gidin
- Hata mesajlarını kontrol edin

### 3. Network Tab Kontrol
- F12 > Network sekmesi
- Hangi API çağrılarının başarısız olduğunu kontrol edin

## Olası Sorun: orderBy Boolean Hatası

`isPremium` boolean field'ı için `orderBy` kullanımı sorun yaratmış olabilir. Prisma'da boolean'lar için özel sıralama gerekebilir.

