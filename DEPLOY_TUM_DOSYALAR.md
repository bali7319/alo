# Tüm Değişiklikleri Sunucuya Yükleme

Yerelde yapılan tüm değişiklikleri sunucuya yüklemek için:

## Yöntem 1: Deploy Script (Önerilen)

Yerel bilgisayarda (PowerShell):

```powershell
cd C:\Users\bali\Desktop\alo
.\deploy.ps1
```

## Yöntem 2: Manuel SCP ile

Yerel bilgisayarda (PowerShell veya Git Bash):

```bash
# Cron ve config dosyaları
scp cron-server.js root@alo17.tr:/var/www/alo17/cron-server.js
scp ecosystem.config.js root@alo17.tr:/var/www/alo17/ecosystem.config.js
scp package.json root@alo17.tr:/var/www/alo17/package.json

# Components
scp src/components/Header.tsx root@alo17.tr:/var/www/alo17/src/components/Header.tsx

# App pages
scp src/app/page.tsx root@alo17.tr:/var/www/alo17/src/app/page.tsx
scp src/app/premium/page.tsx root@alo17.tr:/var/www/alo17/src/app/premium/page.tsx
scp src/app/kategori/[slug]/page.tsx root@alo17.tr:/var/www/alo17/src/app/kategori/[slug]/page.tsx
scp src/app/admin/ayarlar/page.tsx root@alo17.tr:/var/www/alo17/src/app/admin/ayarlar/page.tsx
scp src/app/profil/page.tsx root@alo17.tr:/var/www/alo17/src/app/profil/page.tsx
scp src/app/ilan-ver/page.tsx root@alo17.tr:/var/www/alo17/src/app/ilan-ver/page.tsx

# API routes
scp src/app/api/admin/settings/route.ts root@alo17.tr:/var/www/alo17/src/app/api/admin/settings/route.ts
scp src/app/api/listings/category/[slug]/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/category/[slug]/route.ts
scp src/app/api/listings/user/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/user/route.ts
scp src/app/api/cron/expire-listings/route.ts root@alo17.tr:/var/www/alo17/src/app/api/cron/expire-listings/route.ts
scp src/app/api/listings/[id]/renew/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/[id]/renew/route.ts
```

## Yöntem 3: WinSCP ile

1. WinSCP'yi açın
2. Sunucuya bağlanın
3. Yukarıdaki dosyaları `/var/www/alo17/` klasörüne sürükleyin

## Dosyalar Yüklendikten Sonra (Sunucuda)

```bash
cd /var/www/alo17

# Paketleri güncelle (eğer package.json değiştiyse)
npm install

# Build yap
npm run build

# PM2'yi yeniden başlat
pm2 restart all

# Durumu kontrol et
pm2 status

# Logları kontrol et
pm2 logs --lines 20
```

## Güncellenen Dosyalar Listesi

1. ✅ `cron-server.js` - Cron job servisi
2. ✅ `ecosystem.config.js` - PM2 konfigürasyonu
3. ✅ `package.json` - Bağımlılıklar
4. ✅ `src/components/Header.tsx` - Header (İlan Ver butonu kaldırıldı, arama kaldırıldı)
5. ✅ `src/app/page.tsx` - Ana sayfa (Arama container ve Reklam Ver butonu eklendi)
6. ✅ `src/app/premium/page.tsx` - Premium sayfası (İlan Ver butonu eklendi)
7. ✅ `src/app/kategori/[slug]/page.tsx` - Kategori sayfası (expiresAt kontrolü)
8. ✅ `src/app/admin/ayarlar/page.tsx` - Admin ayarlar (0 = Sınırsız kaldırıldı)
9. ✅ `src/app/profil/page.tsx` - Profil sayfası (Tekrar yayınlama butonu)
10. ✅ `src/app/ilan-ver/page.tsx` - İlan verme (Limit kontrolleri güncellendi)
11. ✅ `src/app/api/admin/settings/route.ts` - Admin settings API
12. ✅ `src/app/api/listings/category/[slug]/route.ts` - Kategori API (expiresAt kontrolü)
13. ✅ `src/app/api/listings/user/route.ts` - Kullanıcı ilanları API
14. ✅ `src/app/api/cron/expire-listings/route.ts` - Cron job API
15. ✅ `src/app/api/listings/[id]/renew/route.ts` - Tekrar yayınlama API

