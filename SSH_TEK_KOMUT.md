# SSH Tek Komut - 502 Hatası Düzeltme

## 🚀 Hızlı Çözüm (Tek Komut)

Sunucuya SSH ile bağlanın ve aşağıdaki komutu çalıştırın:

```bash
cd /var/www/alo17 && npx prisma generate && npm run build && pm2 restart alo17 && pm2 save && pm2 status && echo "✅ Tamamlandı! Port kontrolü:" && ss -tuln | grep :3000
```

## 📋 Detaylı Komut (Adım Adım)

Eğer yukarıdaki komut çalışmazsa, adım adım:

```bash
cd /var/www/alo17
npx prisma generate
npm run build
pm2 restart alo17
pm2 save
pm2 status
ss -tuln | grep :3000
```

## 🔧 Nginx Güncelleme (Ayrı Komut)

Nginx yapılandırmasını güncellemek için (eğer `nginx-site-config.conf` dosyasını yüklediyseniz):

```bash
cd /var/www/alo17 && sudo cp nginx-site-config.conf /etc/nginx/sites-available/alo17.tr && sudo nginx -t && sudo systemctl reload nginx && echo "✅ Nginx güncellendi"
```

## 📝 DATABASE_URL Güncelleme

`.env` dosyasını düzenleyin:

```bash
nano /var/www/alo17/.env
```

DATABASE_URL satırını şu şekilde güncelleyin (connection pool parametreleri ekleyin):

```
DATABASE_URL="postgresql://alo17_user:şifre@localhost:5432/alo17_db?schema=public&connection_limit=10&pool_timeout=20"
```

Kaydedin: `Ctrl+O`, `Enter`, `Ctrl+X`

Sonra PM2'yi yeniden başlatın:
```bash
pm2 restart alo17
```

## ✅ Kontrol Komutları

```bash
# PM2 durumu
pm2 status

# Port kontrolü
ss -tuln | grep :3000

# Nginx durumu
systemctl status nginx

# PM2 logları
pm2 logs alo17 --lines 50

# Nginx error logları
tail -50 /var/log/nginx/alo17-error.log

# Test
curl http://localhost:3000
```

## 🎯 En Hızlı Çözüm (Tüm Adımlar Tek Komut)

```bash
cd /var/www/alo17 && npx prisma generate && npm run build && pm2 restart alo17 && pm2 save && pm2 status && ss -tuln | grep :3000 && systemctl is-active nginx && echo "✅ Tüm işlemler tamamlandı!"
```

