# PM2 Restart Loop Çözümü

## Sorun
PM2 sürekli restart oluyor - Next.js başlatılamıyor.

## Çözüm

### 1. .next Klasörünü Kontrol Et
```bash
cd /var/www/alo17
ls -lah .next
```

### 2. Eğer .next Yoksa veya Bozuksa
Yerel bilgisayardan `.next.zip` dosyasını WinSCP ile yükleyin, sonra:
```bash
cd /var/www/alo17
unzip -o .next.zip
chmod -R 755 .next
```

### 3. PM2'yi Tamamen Durdur ve Temizle
```bash
pm2 kill
pm2 delete all
```

### 4. Tekrar Başlat
```bash
cd /var/www/alo17
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

### 5. Logları Kontrol Et
```bash
pm2 logs alo17 --lines 100
```

