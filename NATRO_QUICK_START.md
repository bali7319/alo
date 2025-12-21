# Natro VPS - Hızlı Başlangıç Rehberi

## ⚡ 5 Dakikada Kurulum

### 1. Sunucuya Bağlan
```bash
ssh root@your-server-ip
```

### 2. Temel Kurulumlar
```bash
# Sistem güncelle
apt update && apt upgrade -y

# Node.js 20 kur
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PostgreSQL kur
apt install -y postgresql postgresql-contrib

# Nginx kur
apt install -y nginx

# PM2 kur
npm install -g pm2
```

### 3. PostgreSQL Veritabanı
```bash
sudo -u postgres psql
```

PostgreSQL shell'de:
```sql
CREATE DATABASE alo17_db;
CREATE USER alo17_user WITH ENCRYPTED PASSWORD 'güçlü-şifre-buraya';
GRANT ALL PRIVILEGES ON DATABASE alo17_db TO alo17_user;
\q
```

### 4. Projeyi Kopyala
```bash
cd /var/www
git clone https://github.com/your-repo/alo17.git
cd alo17
```

### 5. Environment Variables
```bash
nano .env
```

İçerik:
```env
DATABASE_URL="postgresql://alo17_user:güçlü-şifre-buraya@localhost:5432/alo17_db?schema=public"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="rastgele-32-karakter-string-buraya"
NODE_ENV="production"
PORT=3000
```

### 6. Projeyi Kur ve Başlat
```bash
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 start ecosystem.config.js
pm2 save
```

### 7. Nginx Ayarla
```bash
nano /etc/nginx/sites-available/alo17
```

İçerik:
```nginx
server {
    listen 80;
    server_name your-domain.com;

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
    }
}
```

Aktif et:
```bash
ln -s /etc/nginx/sites-available/alo17 /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 8. SSL Kur (Let's Encrypt)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 9. Firewall
```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## ✅ Tamamlandı!

Artık siteniz `https://your-domain.com` adresinde çalışıyor olmalı.

## 🔄 Güncelleme
```bash
cd /var/www/alo17
./deploy.sh
```

## 📊 Durum Kontrolü
```bash
pm2 status
pm2 logs alo17
systemctl status nginx
systemctl status postgresql
```

