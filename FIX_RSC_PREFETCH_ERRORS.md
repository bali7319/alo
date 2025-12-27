# 🔧 RSC Prefetch Hataları - Düzeltme

## 🔍 Sorun

Next.js RSC (React Server Components) prefetch hataları görünüyor:
- `Failed to fetch RSC payload`
- `Failed to fetch` (NextAuth session)

## ⚠️ Not

Bu hatalar genellikle **kritik değildir**:
- Prefetch başarısız olur ama sayfa normal yüklenir
- Next.js otomatik olarak browser navigation'a geçer
- Kullanıcı deneyimini etkilemez

## ✅ Kontrol Adımları

### 1. PM2 Durumunu Kontrol Et

```bash
ssh root@alo17.tr
pm2 status
pm2 logs alo17 --lines 50
```

### 2. Sunucu Log'larını Kontrol Et

```bash
pm2 logs alo17 --err --lines 100
```

### 3. Uygulamayı Yeniden Başlat

```bash
cd /var/www/alo17
pm2 restart alo17
pm2 logs alo17 --lines 20
```

### 4. Build Cache'ini Temizle (Gerekirse)

```bash
cd /var/www/alo17
rm -rf .next
npm run build
pm2 restart alo17
```

## 🔍 Olası Nedenler

1. **PM2 restart sonrası uygulama tam başlamamış** - Birkaç saniye bekleyin
2. **Network timeout** - Prefetch istekleri zaman aşımına uğruyor
3. **Next.js build sorunu** - Build cache'i bozulmuş olabilir
4. **Database bağlantı sorunu** - Prisma connection pool sorunu

## ✅ Hızlı Çözüm

Eğer sayfalar normal yükleniyorsa, bu hatalar görmezden gelinebilir. Next.js otomatik olarak fallback yapıyor.

Eğer sayfalar yüklenmiyorsa:

```bash
ssh root@alo17.tr
cd /var/www/alo17
pm2 restart alo17
pm2 logs alo17 --lines 50
```

