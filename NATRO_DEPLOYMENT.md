# Natro VPS Deployment Rehberi - Alo17

Bu rehber, Alo17 Next.js projesini Natro VPS üzerinde Ubuntu sunucusunda verimli bir şekilde kurmak için hazırlanmıştır.

## 🖥️ Sunucu Gereksinimleri

### Önerilen Sistem Özellikleri:
- **İşletim Sistemi**: Ubuntu 22.04 LTS (önerilen) veya Ubuntu 20.04 LTS
- **RAM**: Minimum 2GB (4GB+ önerilir)
- **CPU**: 2+ core
- **Disk**: 20GB+ SSD
- **Bant Genişliği**: Yeterli trafik kotası

### Neden Ubuntu?
- ✅ Uzun vadeli destek (LTS)
- ✅ Geniş dokümantasyon ve topluluk desteği
- ✅ Güvenlik güncellemeleri
- ✅ Next.js ve Node.js ile mükemmel uyumluluk

---

## 📋 1. Sunucu İlk Kurulum

### SSH Bağlantısı
```bash
ssh root@your-server-ip
# veya
ssh root@your-domain.com
```

### Sistem Güncellemesi
```bash
# Sistem paketlerini güncelle
apt update && apt upgrade -y

# Temel araçları kur
apt install -y curl wget git build-essential
```

### Firewall Ayarları (UFW)
```bash
# UFW'yi etkinleştir
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

---

## 🟢 2. Node.js Kurulumu

### Node.js 20.x LTS Kurulumu (Önerilen)
```bash
# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Node.js kur
apt install -y nodejs

# Versiyon kontrolü
node -v  # v20.x.x olmalı
npm -v
```

### Alternatif: NVM ile Kurulum
```bash
# NVM kur
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Node.js 20 kur
nvm install 20
nvm use 20
nvm alias default 20
```

---

## 🗄️ 3. PostgreSQL Veritabanı Kurulumu

**ÖNEMLİ**: Production ortamında SQLite yerine PostgreSQL kullanılmalıdır!

### PostgreSQL Kurulumu
```bash
# PostgreSQL kur
apt install -y postgresql postgresql-contrib

# PostgreSQL servisini başlat
systemctl start postgresql
systemctl enable postgresql

# PostgreSQL kullanıcı şifresini ayarla
sudo -u postgres psql
```

### PostgreSQL'de Veritabanı Oluşturma
```sql
-- PostgreSQL shell'de çalıştır:
CREATE DATABASE alo17_db;
CREATE USER alo17_user WITH ENCRYPTED PASSWORD 'güçlü-şifre-buraya';
GRANT ALL PRIVILEGES ON DATABASE alo17_db TO alo17_user;
\q
```

### Prisma Schema Güncelleme
`prisma/schema.prisma` dosyasını güncelle:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 📦 4. Proje Kurulumu

### Proje Klasörü Oluşturma
```bash
# Proje için klasör oluştur
mkdir -p /var/www/alo17
cd /var/www/alo17

# Proje sahibini ayarla (opsiyonel: özel kullanıcı oluştur)
# useradd -m -s /bin/bash alo17
# chown -R alo17:alo17 /var/www/alo17
```

### Git ile Proje Çekme
```bash
# Git repository'den çek
git clone https://github.com/your-username/alo17.git .

# veya dosyaları manuel yükle
# scp -r ./alo17/* root@your-server:/var/www/alo17/
```

### Bağımlılıkları Kurma
```bash
cd /var/www/alo17

# Node modules kur
npm install --production

# Prisma client generate
npx prisma generate

# Environment variables dosyası oluştur
nano .env
```

### .env Dosyası Örneği
```env
# Database
DATABASE_URL="postgresql://alo17_user:güçlü-şifre-buraya@localhost:5432/alo17_db?schema=public"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="çok-güçlü-rastgele-string-buraya-32-karakter"

# Node Environment
NODE_ENV="production"

# Diğer gerekli değişkenler
# ...
```

### Prisma Migration
```bash
# Veritabanı migration'ları çalıştır
npx prisma migrate deploy

# veya ilk kurulum için
npx prisma migrate dev
```

---

## 🚀 5. PM2 ile Process Management

### PM2 Kurulumu
```bash
npm install -g pm2
```

### PM2 Ecosystem Dosyası Oluştur
```bash
cd /var/www/alo17
nano ecosystem.config.js
```

### ecosystem.config.js İçeriği
```javascript
module.exports = {
  apps: [{
    name: 'alo17',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/alo17',
    instances: 2, // CPU core sayısına göre ayarla
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/alo17/error.log',
    out_file: '/var/log/alo17/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

### Log Klasörü Oluştur
```bash
mkdir -p /var/log/alo17
```

### PM2 ile Başlatma
```bash
# Build projeyi
npm run build

# PM2 ile başlat
pm2 start ecosystem.config.js

# PM2'yi sistem başlangıcında otomatik başlat
pm2 startup
pm2 save

# Durum kontrolü
pm2 status
pm2 logs alo17
```

---

## 🌐 6. Nginx Reverse Proxy Kurulumu

### Nginx Kurulumu
```bash
apt install -y nginx
```

### Nginx Konfigürasyonu
```bash
nano /etc/nginx/sites-available/alo17
```

### Nginx Config İçeriği
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # SSL için Let's Encrypt doğrulaması
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # HTTP'den HTTPS'e yönlendirme (SSL kurulumundan sonra)
    # return 301 https://$server_name$request_uri;

    # Geçici olarak HTTP üzerinden çalıştırma
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout ayarları
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static dosyalar için cache
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

### Nginx'i Aktif Et
```bash
# Site'ı aktif et
ln -s /etc/nginx/sites-available/alo17 /etc/nginx/sites-enabled/

# Default site'ı devre dışı bırak (opsiyonel)
rm /etc/nginx/sites-enabled/default

# Nginx konfigürasyonunu test et
nginx -t

# Nginx'i yeniden başlat
systemctl restart nginx
systemctl enable nginx
```

---

## 🔒 7. SSL Sertifikası (Let's Encrypt)

### Certbot Kurulumu
```bash
apt install -y certbot python3-certbot-nginx
```

### SSL Sertifikası Alma
```bash
# Tek komutla SSL kurulumu
certbot --nginx -d your-domain.com -d www.your-domain.com

# Otomatik yenileme testi
certbot renew --dry-run
```

### Otomatik Yenileme
Certbot otomatik olarak sistemde bir cron job oluşturur. Manuel kontrol:
```bash
systemctl status certbot.timer
```

---

## 🔧 8. Optimizasyon ve Güvenlik

### Sistem Optimizasyonu
```bash
# Swap dosyası oluştur (RAM yetersizse)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

### Güvenlik Ayarları
```bash
# Fail2ban kurulumu (brute force koruması)
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Root login'i devre dışı bırak (önerilir)
# nano /etc/ssh/sshd_config
# PermitRootLogin no
# systemctl restart sshd
```

### Nginx Güvenlik Headers
`/etc/nginx/sites-available/alo17` dosyasına ekle:
```nginx
# Güvenlik headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## 📊 9. Monitoring ve Log Yönetimi

### PM2 Monitoring
```bash
# PM2 monitoring dashboard
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Log Rotasyon
```bash
# Logrotate konfigürasyonu
nano /etc/logrotate.d/alo17
```

İçerik:
```
/var/log/alo17/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
```

---

## 🔄 10. Güncelleme ve Bakım

### Proje Güncelleme
```bash
cd /var/www/alo17

# Değişiklikleri çek
git pull origin main

# Bağımlılıkları güncelle
npm install --production

# Prisma migration
npx prisma generate
npx prisma migrate deploy

# Projeyi yeniden build et
npm run build

# PM2'yi yeniden başlat
pm2 restart alo17
```

### Veritabanı Yedekleme
```bash
# PostgreSQL yedekleme scripti oluştur
nano /root/backup-db.sh
```

İçerik:
```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U alo17_user alo17_db > $BACKUP_DIR/alo17_db_$DATE.sql
# Eski yedekleri temizle (7 günden eski)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

Çalıştırılabilir yap:
```bash
chmod +x /root/backup-db.sh

# Cron job ekle (her gün saat 02:00'de)
crontab -e
# Şunu ekle:
0 2 * * * /root/backup-db.sh
```

---

## 🐛 11. Sorun Giderme

### PM2 Logları
```bash
pm2 logs alo17 --lines 100
```

### Nginx Logları
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### PostgreSQL Logları
```bash
tail -f /var/log/postgresql/postgresql-*.log
```

### Port Kontrolü
```bash
netstat -tulpn | grep :3000
netstat -tulpn | grep :80
netstat -tulpn | grep :443
```

### Servis Durumları
```bash
systemctl status nginx
systemctl status postgresql
pm2 status
```

---

## 📝 12. Hızlı Komutlar Özeti

```bash
# Proje durumu
pm2 status
pm2 logs alo17

# Nginx kontrol
nginx -t
systemctl restart nginx

# PostgreSQL kontrol
systemctl status postgresql
sudo -u postgres psql -d alo17_db

# Proje yeniden başlatma
cd /var/www/alo17
git pull
npm install
npm run build
pm2 restart alo17

# Disk kullanımı
df -h
du -sh /var/www/alo17

# RAM kullanımı
free -h
```

---

## ✅ Kontrol Listesi

- [ ] Ubuntu 22.04 LTS kurulu
- [ ] Node.js 20.x kurulu
- [ ] PostgreSQL kurulu ve veritabanı oluşturuldu
- [ ] Prisma schema PostgreSQL'e güncellendi
- [ ] .env dosyası oluşturuldu ve dolduruldu
- [ ] Proje build edildi
- [ ] PM2 ile uygulama çalışıyor
- [ ] Nginx reverse proxy yapılandırıldı
- [ ] SSL sertifikası kuruldu
- [ ] Firewall ayarları yapıldı
- [ ] Yedekleme sistemi kuruldu
- [ ] Monitoring ayarları yapıldı

---

## 🆘 Destek

Sorun yaşarsanız:
1. PM2 loglarını kontrol edin: `pm2 logs alo17`
2. Nginx loglarını kontrol edin: `tail -f /var/log/nginx/error.log`
3. Sistem kaynaklarını kontrol edin: `htop` veya `free -h`
4. Port'ların açık olduğunu kontrol edin: `netstat -tulpn`

---

## 📚 Ek Kaynaklar

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Let's Encrypt](https://letsencrypt.org/)

