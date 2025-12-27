# 🧹 Sunucu Temizlik ve İlan Kontrol

## 🔍 Önce Tüm İlanları Kontrol Et

```bash
ssh root@alo17.tr
cd /var/www/alo17
node scripts/check-all-listings-in-db.js
```

Bu script:
- Veritabanındaki TÜM ilanları sayar
- Durumlara göre gruplar
- Son 20 ilanı listeler
- "Örnek" içeren ilanları bulur

## 🧹 Kullanılmayan Dosyaları Temizle

### 1. Script'i Sunucuya Aktar

```powershell
cd C:\Users\bali\Desktop\alo
scp scripts/cleanup-unused-files.sh root@alo17.tr:/var/www/alo17/scripts/
scp scripts/check-all-listings-in-db.js root@alo17.tr:/var/www/alo17/scripts/
```

### 2. Sunucuda Çalıştır

```bash
ssh root@alo17.tr
cd /var/www/alo17

# Önce tüm ilanları kontrol et
node scripts/check-all-listings-in-db.js

# Sonra temizlik yap
chmod +x scripts/cleanup-unused-files.sh
bash scripts/cleanup-unused-files.sh
```

## 📋 Temizlenecek Dosyalar

- ✅ `.next` klasörü (build cache)
- ✅ `*.log` dosyaları
- ✅ `*.tmp`, `*.temp` dosyaları
- ✅ `.DS_Store`, `Thumbs.db` dosyaları
- ⚠️ Backup dosyaları (manuel kontrol gerekli)

## ⚠️ Dikkat

- `node_modules` silinmeyecek (gerekli)
- `scripts` klasörü silinmeyecek
- Sadece cache ve geçici dosyalar temizlenecek

