# 🚀 Tek Komut - Sunucu Temizlik ve Kontrol

## 📋 Veritabanı Kontrol (Tek Komut)

```powershell
cd C:\Users\bali\Desktop\alo; scp scripts/check-all-listings-in-db.js root@alo17.tr:/var/www/alo17/scripts/; ssh root@alo17.tr "cd /var/www/alo17 && node scripts/check-all-listings-in-db.js"
```

## 🧹 Temizlik (Tek Komut)

```powershell
cd C:\Users\bali\Desktop\alo; scp scripts/cleanup-unused-files.sh root@alo17.tr:/var/www/alo17/scripts/; ssh root@alo17.tr "cd /var/www/alo17 && chmod +x scripts/cleanup-unused-files.sh && bash scripts/cleanup-unused-files.sh"
```

## 🔄 Her İkisi Birden

```powershell
cd C:\Users\bali\Desktop\alo; scp scripts/check-all-listings-in-db.js scripts/cleanup-unused-files.sh root@alo17.tr:/var/www/alo17/scripts/; ssh root@alo17.tr "cd /var/www/alo17 && node scripts/check-all-listings-in-db.js && chmod +x scripts/cleanup-unused-files.sh && bash scripts/cleanup-unused-files.sh"
```

