# Deploy Adımları

## 📦 Değişen Dosyalar

1. `src/app/admin/page.tsx` - Demo ilan kontrol butonları eklendi
2. `src/app/api/admin/check-demo-listings/route.ts` - Demo ilan kontrol API'si (zaten var)
3. `scripts/check-and-delete-demo-listings.js` - Demo ilan silme scripti (yeni)

## 🚀 Deploy Komutları

### 1. Dosyaları Sunucuya Aktar

```powershell
# PowerShell'de çalıştır
cd C:\Users\bali\Desktop\alo

# Admin sayfası
scp src/app/admin/page.tsx root@alo17.tr:/var/www/alo17/src/app/admin/page.tsx

# API route (eğer değiştiyse)
scp src/app/api/admin/check-demo-listings/route.ts root@alo17.tr:/var/www/alo17/src/app/api/admin/check-demo-listings/route.ts

# Script
scp scripts/check-and-delete-demo-listings.js root@alo17.tr:/var/www/alo17/scripts/check-and-delete-demo-listings.js
```

### 2. Sunucuda Build ve Restart

```bash
# SSH ile sunucuya bağlan
ssh root@alo17.tr

# Proje dizinine git
cd /var/www/alo17

# Build cache'i temizle
rm -rf .next

# Build al
npm run build

# PM2 ile restart
pm2 restart alo17

# Logları kontrol et
pm2 logs alo17 --lines 50
```

## ✅ Kontrol

1. Admin paneline giriş yap: `http://alo17.tr/admin`
2. "Demo/Örnek İlanları Kontrol Et" butonunu gör
3. Butona tıkla ve çalıştığını kontrol et
