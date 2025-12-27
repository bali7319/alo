# Son Kontrol Komutları

PM2 çalışıyor! Şimdi son kontrolleri yapalım:

## 1. Port Kontrolü

```bash
# Port 3000 dinleniyor mu?
netstat -tuln | grep :3000
# veya
ss -tuln | grep :3000
```

**Beklenen çıktı:**
```
tcp    0    0 0.0.0.0:3000    0.0.0.0:*    LISTEN
```

## 2. Nginx Durumu

```bash
# Nginx çalışıyor mu?
systemctl status nginx

# Nginx hata logları
tail -20 /var/log/nginx/error.log
```

## 3. Uygulama Testi (Sunucuda)

```bash
# Localhost'tan test et
curl http://localhost:3000

# API endpoint testi
curl http://localhost:3000/api/listings
```

## 4. PM2 Detaylı Bilgi

```bash
# PM2 detaylı bilgi
pm2 info alo17

# PM2 monitör (canlı izleme - çıkmak için Ctrl+C)
pm2 monit
```

## 5. prerender-manifest.json Hatası Düzeltme (Opsiyonel)

Eğer hata devam ederse:

```bash
cd /var/www/alo17

# .next klasörünü kontrol et
ls -la .next/ | head -20

# Eğer prerender-manifest.json yoksa, build'i tekrar yap
npm run build

# PM2'yi yeniden başlat
pm2 restart alo17
```

**Not:** Bu hata genellikle önemli değil, Next.js otomatik oluşturuyor.

## 6. Tarayıcıda Test

1. Tarayıcıda açın: `https://alo17.tr`
2. 502 hatası gitti mi kontrol edin
3. Ana sayfa yükleniyor mu bakın
4. Bir API endpoint'i test edin: `https://alo17.tr/api/listings`

---

## ✅ Başarı Kriterleri

- ✅ PM2 status: **online**
- ✅ Port 3000: **LISTEN**
- ✅ Nginx: **active (running)**
- ✅ Tarayıcıda: **502 hatası yok**
- ✅ Site açılıyor: **Ana sayfa görünüyor**

---

## 🔧 Sorun Giderme

### Eğer hala 502 hatası varsa:

```bash
# 1. PM2 loglarını kontrol et
pm2 logs alo17 --err --lines 50

# 2. Nginx error loglarını kontrol et
tail -50 /var/log/nginx/error.log

# 3. Port 3000'i kontrol et
ss -tuln | grep :3000

# 4. Next.js uygulamasını manuel test et
curl -v http://localhost:3000
```

### Eğer port 3000 dinlenmiyorsa:

```bash
# PM2'yi durdur ve tekrar başlat
pm2 stop alo17
pm2 start ecosystem.config.js
pm2 save
```

