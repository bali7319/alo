#!/bin/bash
# 502 Hatası Düzeltme Testi

echo "🔍 502 Hatası Düzeltme Testi"
echo ""

cd /var/www/alo17

# 1. PM2 Durumu
echo "1️⃣ PM2 Durumu:"
pm2 status
echo ""

# 2. Port 3000 Kontrolü
echo "2️⃣ Port 3000 Kontrolü:"
ss -tuln | grep :3000 || echo "❌ Port 3000 dinlenmiyor!"
echo ""

# 3. API Endpoint Testi (localhost)
echo "3️⃣ API Endpoint Testi (localhost:3000):"
echo "   - /api/listings/user:"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n   Time: %{time_total}s\n" http://localhost:3000/api/listings/user || echo "   ❌ Bağlantı başarısız!"
echo ""

echo "   - /api/listings/favorites:"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n   Time: %{time_total}s\n" http://localhost:3000/api/listings/favorites || echo "   ❌ Bağlantı başarısız!"
echo ""

# 4. PM2 Son Hatalar
echo "4️⃣ PM2 Son Hatalar (Son 10 satır):"
pm2 logs alo17 --err --lines 10 --nostream | tail -10
echo ""

# 5. Nginx 502 Hataları
echo "5️⃣ Son 502 Hataları (Nginx Access Log - Son 5):"
tail -100 /var/log/nginx/access.log 2>/dev/null | grep " 502 " | tail -5 || echo "   ✅ Son 100 istekte 502 hatası yok!"
echo ""

echo "✅ Test tamamlandı!"
echo ""
echo "📋 Sonuçlar:"
echo "- Eğer API endpoint'leri 200, 401 veya 503 döndürüyorsa → ✅ Düzeltme başarılı!"
echo "- Eğer API endpoint'leri 502 döndürüyorsa → ❌ Sorun devam ediyor, logları kontrol edin"
echo "- Eğer Nginx'te 502 hatası yoksa → ✅ Düzeltme başarılı!"

