# 🚨 502 Bad Gateway Hatası - Acil Düzeltme

## 🔍 Sorun

502 hatası alınıyor - sunucu yanıt vermiyor. PM2 restart sonrası uygulama çökmüş olabilir.

## ✅ Çözüm: Sunucu Durumunu Kontrol Et

### 1. PM2 Durumunu Kontrol Et

```bash
ssh root@alo17.tr
pm2 status
pm2 logs alo17 --lines 50
```

### 2. Uygulamayı Yeniden Başlat

```bash
cd /var/www/alo17
pm2 restart alo17
pm2 logs alo17 --lines 20
```

### 3. Eğer Hala Çalışmıyorsa

```bash
pm2 delete alo17
cd /var/www/alo17
npm run build
pm2 start npm --name "alo17" -- start
pm2 save
```

## 🔍 Olası Nedenler

1. **Build hatası** - TypeScript/compilation hatası
2. **Database bağlantı hatası** - Prisma connection sorunu
3. **Port çakışması** - 3000 portu kullanımda
4. **Memory hatası** - Sunucu RAM dolmuş

## ✅ Hızlı Kontrol Komutları

```bash
# PM2 durumu
pm2 status

# Son log'lar
pm2 logs alo17 --lines 50 --err

# Port kontrolü
netstat -tulpn | grep 3000

# Memory kontrolü
free -h

# Process kontrolü
ps aux | grep node
```

