# Sunucu SSH Kontrol Rehberi

## Hızlı Kontrol Komutları

### 1. SSH Bağlantısı
```bash
ssh kullanici-adi@sunucu-ip
```

### 2. PM2 Durumu Kontrolü
```bash
ssh kullanici-adi@sunucu-ip "pm2 list"
```

### 3. Uygulama Logları
```bash
# Error logları
ssh kullanici-adi@sunucu-ip "tail -50 /var/www/alo17/logs/error.log"

# Output logları
ssh kullanici-adi@sunucu-ip "tail -50 /var/www/alo17/logs/out.log"
```

### 4. Disk ve Bellek Kullanımı
```bash
# Disk kullanımı
ssh kullanici-adi@sunucu-ip "df -h"

# Bellek kullanımı
ssh kullanici-adi@sunucu-ip "free -h"
```

### 5. Port Kontrolü
```bash
# Port 3000 dinleniyor mu?
ssh kullanici-adi@sunucu-ip "netstat -tuln | grep :3000"
# veya
ssh kullanici-adi@sunucu-ip "ss -tuln | grep :3000"
```

### 6. Git Durumu
```bash
ssh kullanici-adi@sunucu-ip "cd /var/www/alo17 && git status"
```

### 7. Node.js Versiyonları
```bash
ssh kullanici-adi@sunucu-ip "node --version && npm --version"
```

### 8. Uygulama Yeniden Başlatma
```bash
ssh kullanici-adi@sunucu-ip "cd /var/www/alo17 && pm2 restart alo17"
```

### 9. .env Dosyası Kontrolü
```bash
ssh kullanici-adi@sunucu-ip "cd /var/www/alo17 && ls -lh .env"
```

### 10. Database Bağlantı Testi
```bash
ssh kullanici-adi@sunucu-ip "cd /var/www/alo17 && npx prisma db pull"
```

## Otomatik Kontrol Script'leri

### Linux/Mac için:
```bash
chmod +x check-server.sh
./check-server.sh sunucu-ip kullanici-adi
```

### Windows PowerShell için:
```powershell
.\check-server.ps1 -ServerIP "sunucu-ip" -Username "kullanici-adi"
```

## Önemli Notlar

1. **SSH Key Kullanımı**: Güvenlik için SSH key kullanmanız önerilir
2. **Port**: Varsayılan SSH portu 22'dir, farklıysa `-p` parametresi kullanın
3. **PM2**: Uygulama PM2 ile yönetiliyorsa `pm2` komutlarını kullanın
4. **Loglar**: Log dosyaları `/var/www/alo17/logs/` dizininde

## Sorun Giderme

### SSH Bağlantı Hatası
```bash
# Bağlantı timeout ayarı ile
ssh -o ConnectTimeout=10 kullanici-adi@sunucu-ip
```

### Permission Denied
```bash
# SSH key izinlerini kontrol edin
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### PM2 Komutu Bulunamadı
```bash
# PM2 global olarak yüklü mü kontrol edin
ssh kullanici-adi@sunucu-ip "which pm2"
# veya
ssh kullanici-adi@sunucu-ip "npm list -g pm2"
```

