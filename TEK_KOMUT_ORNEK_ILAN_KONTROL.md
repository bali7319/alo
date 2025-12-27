# Tek Komut ile "Örnek İlan" Kontrol

## 🚀 Tek Komut (PowerShell)

```powershell
cd C:\Users\bali\Desktop\alo; scp scripts/check-all-demo-listings.js root@alo17.tr:/var/www/alo17/scripts/; ssh root@alo17.tr "cd /var/www/alo17 && node scripts/check-all-demo-listings.js"
```

## 📋 Adım Adım

1. **Script'i aktar ve çalıştır:**
```powershell
cd C:\Users\bali\Desktop\alo
scp scripts/check-all-demo-listings.js root@alo17.tr:/var/www/alo17/scripts/
ssh root@alo17.tr "cd /var/www/alo17 && node scripts/check-all-demo-listings.js"
```

2. **Sadece çalıştır (script zaten varsa):**
```powershell
ssh root@alo17.tr "cd /var/www/alo17 && node scripts/check-all-demo-listings.js"
```

