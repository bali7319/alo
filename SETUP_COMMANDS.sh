#!/bin/bash

# Natro VPS - İlk Kurulum Komutları
# Bu komutları root olarak çalıştırın

set -e

echo "🚀 Alo17 VPS Kurulumu Başlatılıyor..."

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Sistem Güncellemesi
echo -e "${YELLOW}📦 Sistem güncelleniyor...${NC}"
apt update && apt upgrade -y

# 2. Temel Araçlar
echo -e "${YELLOW}🔧 Temel araçlar kuruluyor...${NC}"
apt install -y curl wget git build-essential

# 3. Node.js 20.x Kurulumu
echo -e "${YELLOW}🟢 Node.js kuruluyor...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Versiyon kontrolü
echo -e "${GREEN}✅ Node.js versiyonu:$(node -v)${NC}"
echo -e "${GREEN}✅ npm versiyonu:$(npm -v)${NC}"

# 4. PostgreSQL Kurulumu
echo -e "${YELLOW}🗄️ PostgreSQL kuruluyor...${NC}"
apt install -y postgresql postgresql-contrib

# PostgreSQL servisini başlat
systemctl start postgresql
systemctl enable postgresql

# 5. Nginx Kurulumu
echo -e "${YELLOW}🌐 Nginx kuruluyor...${NC}"
apt install -y nginx

# 6. PM2 Kurulumu
echo -e "${YELLOW}⚙️ PM2 kuruluyor...${NC}"
npm install -g pm2

# 7. Firewall Ayarları
echo -e "${YELLOW}🔥 Firewall ayarlanıyor...${NC}"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 8. Proje Klasörü
echo -e "${YELLOW}📁 Proje klasörü oluşturuluyor...${NC}"
mkdir -p /var/www/alo17
cd /var/www/alo17

echo -e "${GREEN}✅ Temel kurulum tamamlandı!${NC}"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. PostgreSQL veritabanı oluştur: sudo -u postgres psql"
echo "2. Projeyi kopyala: git clone ... veya dosyaları yükle"
echo "3. .env dosyası oluştur"
echo "4. npm install && npm run build"
echo "5. PM2 ile başlat"

