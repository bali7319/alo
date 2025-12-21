# Sunucu Bellek Sorunu Çözümü

## 1. Bellek Durumunu Kontrol Et
```bash
free -h
df -h
```

## 2. Şüpheli Process'leri Kontrol Et
```bash
ps aux | grep -E "\.update|sleep 30" | grep -v grep
```

## 3. Şüpheli Dosyayı Kontrol Et ve Kaldır
```bash
# Dosyayı kontrol et
ls -lah /usr/bin/.update

# Dosyayı kaldır (eğer şüpheli ise)
rm -f /usr/bin/.update

# .bashrc ve /etc/profile'dan referansları temizle
sed -i '/\.update/d' /root/.bashrc
sed -i '/\.update/d' /etc/profile
```

## 4. Çalışan Process'leri Kontrol Et
```bash
ps aux --sort=-%mem | head -20
```

## 5. PM2 Process'lerini Kontrol Et
```bash
pm2 list
pm2 logs --lines 50
```

## 6. Swap Dosyasını Kontrol Et
```bash
swapon --show
```

## 7. Güncellemeleri Yap (Düşük Bellek Kullanımıyla)
```bash
cd /var/www/alo17

# PM2'yi durdur
pm2 stop all

# Biraz bekle (bellek boşalsın)
sleep 10

# Git pull
git pull

# Sadece gerekli paketleri yükle
npm install --production

# Prisma schema'yı güncelle
npx prisma db push

# Build yap (bellek limiti ile)
NODE_OPTIONS="--max-old-space-size=1024" npm run build

# PM2'yi başlat
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

## 8. Eğer Hala Sorun Varsa
```bash
# Tüm PM2 process'lerini kapat
pm2 kill

# Swap dosyası oluştur (eğer yoksa)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Tekrar build dene
cd /var/www/alo17
NODE_OPTIONS="--max-old-space-size=1024" npm run build
pm2 start ecosystem.config.js
```

