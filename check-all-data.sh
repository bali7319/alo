#!/bin/bash
# Tüm verileri kontrol et

echo "=== API Yanıtı (tam) ==="
curl -s "http://localhost:3000/api/listings?page=1&limit=100"

echo ""
echo ""
echo "=== Veritabanındaki TÜM İlanlar (aktif/pasif fark etmez) ==="
sudo -u postgres psql -d alo17_db << 'EOF'
SELECT id, title, category, "approvalStatus", "isActive", "expiresAt"
FROM "Listing" 
ORDER BY "createdAt" DESC;
EOF

echo ""
echo "=== PM2 Logları (son 20 satır) ==="
pm2 logs alo17 --lines 20 --nostream

