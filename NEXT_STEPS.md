# Sonraki Adımlar - Proje Kurulumu

## ✅ Tamamlananlar
- ✅ Sistem güncellemesi
- ✅ Temel araçlar (curl, wget, git, build-essential)
- ✅ Node.js 20.19.6 kuruldu
- ✅ PostgreSQL 12 kuruldu ve veritabanı oluşturuldu
- ✅ Nginx kuruldu

## 🔄 Şimdi Yapılacaklar

### 1. PM2 Kurulumu
```bash
npm install -g pm2
```

### 2. Firewall Ayarları
```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

### 3. Proje Klasörü Oluştur
```bash
mkdir -p /var/www/alo17
cd /var/www/alo17
```

### 4. Projeyi Kopyala

**Seçenek A: Git ile (eğer repository varsa)**
```bash
git clone https://github.com/your-username/alo17.git .
```

**Seçenek B: Manuel Dosya Yükleme**
Bilgisayarınızdan sunucuya dosyaları yüklemek için:
```bash
# Windows PowerShell'de (bilgisayarınızdan)
scp -r C:\Users\bali\Desktop\alo\* root@alo17.tr:/var/www/alo17/
```

### 5. .env Dosyası Oluştur
```bash
cd /var/www/alo17
nano .env
```

İçerik (şifreleri değiştirin!):
```env
DATABASE_URL="postgresql://alo17_user:güçlü-şifre-buraya@localhost:5432/alo17_db?schema=public"
NEXTAUTH_URL="https://alo17.tr"
NEXTAUTH_SECRET="rastgele-32-karakter-uzunluğunda-güçlü-string-buraya"
NODE_ENV="production"
PORT=3000
```

**NEXTAUTH_SECRET oluşturmak için:**
```bash
openssl rand -base64 32
```

### 6. Bağımlılıkları Kur ve Build Et
```bash
cd /var/www/alo17
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build
```

### 7. PM2 ile Başlat
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Nginx Konfigürasyonu
```bash
nano /etc/nginx/sites-available/alo17
```

İçerik:
```nginx
server {
    listen 80;
    server_name alo17.tr www.alo17.tr;

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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Aktif et:
```bash
ln -s /etc/nginx/sites-available/alo17 /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Default site'ı kaldır
nginx -t
systemctl restart nginx
```

### 9. SSL Sertifikası (Let's Encrypt)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d alo17.tr -d www.alo17.tr
```

## ✅ Kontrol
```bash
# PM2 durumu
pm2 status

# PM2 logları
pm2 logs alo17

# Nginx durumu
systemctl status nginx

# PostgreSQL durumu
systemctl status postgresql

# Port kontrolü
netstat -tulpn | grep :3000
```

## 🎉 Tamamlandı!

Artık siteniz `https://alo17.tr` adresinde çalışıyor olmalı!

