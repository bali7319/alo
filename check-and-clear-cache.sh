#!/bin/bash
# Örnek ilanları kontrol et ve cache temizle

echo "Örnek kelimesi içeren ilanları kontrol ediliyor..."
sudo -u postgres psql -d alo17_db << 'EOF'
SELECT id, title, "approvalStatus", "isActive" 
FROM "Listing" 
WHERE title ILIKE '%örnek%' OR title ILIKE '%Örnek%';
EOF

echo ""
echo "Tüm ilanları listele (aktif/pasif fark etmez)..."
sudo -u postgres psql -d alo17_db << 'EOF'
SELECT id, title, category, "approvalStatus", "isActive" 
FROM "Listing" 
ORDER BY "createdAt" DESC 
LIMIT 10;
EOF

echo ""
echo "Cache temizleniyor..."
cd /var/www/alo17
rm -rf .next/cache
rm -rf .next/static

echo ""
echo "PM2 yeniden başlatılıyor..."
pm2 restart alo17

echo ""
echo "İşlem tamamlandı! Lütfen tarayıcıda hard refresh yapın (Ctrl+Shift+R veya Ctrl+F5)"

