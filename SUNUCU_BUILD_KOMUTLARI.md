# Sunucuda Build Komutları

SSH ile sunucuya bağlandıktan sonra sırayla çalıştırın:

```bash
# 1. Proje dizinine git (zaten oradasınız)
cd /var/www/alo17

# 2. Cache'i temizle
rm -rf .next/cache
rm -rf .next

# 3. Prisma client oluştur
npx prisma generate

# 4. Build yap (3-5 dakika sürebilir)
npm run build

# 5. Build başarılıysa PM2'yi restart et
pm2 restart alo17

# 6. Log'ları kontrol et
pm2 logs alo17 --err --lines 20
```

## Tek Komut (Kopyala-Yapıştır)

```bash
cd /var/www/alo17 && rm -rf .next/cache .next && npx prisma generate && npm run build && pm2 restart alo17 && pm2 logs alo17 --err --lines 20
```

