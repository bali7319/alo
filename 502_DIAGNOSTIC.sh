#!/bin/bash
# 502 Bad Gateway Hatası Teşhis Scripti

echo "🔍 502 Bad Gateway Hatası Teşhisi Başlatılıyor..."
echo ""

# 1. PM2 Durumu
echo "1️⃣ PM2 Durumu:"
pm2 status
echo ""

# 2. Port 3000 Kontrolü
echo "2️⃣ Port 3000 Kontrolü:"
ss -tuln | grep :3000 || echo "❌ Port 3000 dinlenmiyor!"
echo ""

# 3. PM2 Logları (Son 20 satır)
echo "3️⃣ PM2 Hata Logları (Son 20 satır):"
pm2 logs alo17 --err --lines 20 --nostream
echo ""

# 4. PM2 Çıktı Logları (Son 20 satır)
echo "4️⃣ PM2 Çıktı Logları (Son 20 satır):"
pm2 logs alo17 --out --lines 20 --nostream
echo ""

# 5. Nginx Durumu
echo "5️⃣ Nginx Durumu:"
systemctl status nginx --no-pager -l | head -20
echo ""

# 6. Nginx Error Logları (Son 20 satır)
echo "6️⃣ Nginx Error Logları (Son 20 satır):"
tail -20 /var/log/nginx/error.log 2>/dev/null || echo "Nginx error log bulunamadı"
echo ""

# 7. Nginx Access Logları - 502 Hataları
echo "7️⃣ Son 502 Hataları (Nginx Access Log):"
tail -100 /var/log/nginx/access.log 2>/dev/null | grep " 502 " | tail -10 || echo "502 hatası bulunamadı"
echo ""

# 8. Next.js Uygulamasına Manuel Test
echo "8️⃣ Next.js Uygulamasına Manuel Test (localhost:3000):"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\nTime: %{time_total}s\n" http://localhost:3000/api/listings/user || echo "❌ Bağlantı başarısız!"
echo ""

# 9. Database Bağlantı Testi
echo "9️⃣ Database Bağlantı Testi:"
cd /var/www/alo17
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => {
    console.log('✅ Database bağlantısı başarılı');
    return prisma.\$disconnect();
  })
  .catch((err) => {
    console.error('❌ Database bağlantı hatası:', err.message);
    process.exit(1);
  });
" 2>&1
echo ""

# 10. Memory Kullanımı
echo "🔟 Memory Kullanımı:"
free -h
echo ""

# 11. Disk Kullanımı
echo "1️⃣1️⃣ Disk Kullanımı:"
df -h /var/www/alo17
echo ""

# 12. Node.js Versiyonu
echo "1️⃣2️⃣ Node.js Versiyonu:"
node --version
echo ""

# 13. .next Klasörü Kontrolü
echo "1️⃣3️⃣ .next Klasörü Kontrolü:"
if [ -f "/var/www/alo17/.next/prerender-manifest.json" ]; then
  echo "✅ prerender-manifest.json mevcut"
  ls -lh /var/www/alo17/.next/prerender-manifest.json
else
  echo "❌ prerender-manifest.json eksik!"
fi
echo ""

# 14. PM2 Restart Sayısı
echo "1️⃣4️⃣ PM2 Restart Sayısı:"
pm2 describe alo17 | grep -E "restarts|status|uptime" || echo "PM2 bilgisi alınamadı"
echo ""

echo "✅ Teşhis tamamlandı!"
echo ""
echo "📋 Öneriler:"
echo "1. Eğer port 3000 dinlenmiyorsa: pm2 restart alo17"
echo "2. Eğer database bağlantı hatası varsa: DATABASE_URL'i kontrol edin"
echo "3. Eğer memory dolmuşsa: pm2 restart alo17"
echo "4. Eğer prerender-manifest.json eksikse: npm run build"
echo "5. Eğer Nginx 502 veriyorsa: systemctl restart nginx"

