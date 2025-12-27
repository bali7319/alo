#!/bin/bash
# 502 Hatası Düzeltme - Tek Komut
# SSH ile sunucuda çalıştırın: bash <(curl -s https://...) veya dosyayı yükleyip çalıştırın

set -e

echo "🔧 502 Bad Gateway Hatası Düzeltme Başlatılıyor..."

cd /var/www/alo17

# 1. Nginx yapılandırmasını güncelle (eğer nginx-site-config.conf dosyası varsa)
if [ -f "nginx-site-config.conf" ]; then
    echo "📝 Nginx yapılandırması güncelleniyor..."
    sudo cp nginx-site-config.conf /etc/nginx/sites-available/alo17.tr
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Nginx güncellendi"
fi

# 2. Prisma client'ı yeniden oluştur
echo "🔄 Prisma client yeniden oluşturuluyor..."
npx prisma generate

# 3. Build yap
echo "🏗️  Build yapılıyor..."
npm run build

# 4. PM2'yi yeniden başlat
echo "🔄 PM2 yeniden başlatılıyor..."
pm2 restart alo17

# 5. PM2'yi kaydet
pm2 save

# 6. Kontroller
echo ""
echo "📊 Durum Kontrolleri:"
echo "===================="
pm2 status
echo ""
echo "Port 3000 kontrolü:"
ss -tuln | grep :3000 || echo "⚠️  Port 3000 dinlenmiyor!"
echo ""
echo "Nginx durumu:"
systemctl is-active nginx && echo "✅ Nginx çalışıyor" || echo "❌ Nginx çalışmıyor"
echo ""
echo "✅ İşlem tamamlandı!"
echo ""
echo "📋 Son kontroller:"
echo "  - PM2 logları: pm2 logs alo17 --lines 50"
echo "  - Nginx logları: tail -50 /var/log/nginx/alo17-error.log"
echo "  - Test: curl http://localhost:3000"

