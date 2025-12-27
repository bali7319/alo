#!/bin/bash
# Deploy Script - Kategori ve Resim Düzeltmeleri
# Tarih: $(date +"%Y-%m-%d %H:%M")

echo "========================================"
echo "Deploy Başlatılıyor..."
echo "========================================"
echo ""

echo "Değiştirilen Dosyalar:"
echo "  ✓ src/components/featured-ads.tsx"
echo "  ✓ src/components/latest-ads.tsx"
echo "  ✓ src/app/kategori/[slug]/page.tsx"
echo "  ✓ src/app/page.tsx"
echo "  ✓ src/components/listing-card.tsx"
echo ""

echo "Sunucuya bağlanılıyor..."
echo ""

# Deploy komutu
ssh root@alo17.tr << 'EOF'
cd /var/www/alo17
pm2 stop alo17 2>/dev/null || true
npm install
npm run build
pm2 restart alo17 || pm2 start npm --name alo17 -- start
EOF

echo ""
echo "========================================"
echo "Deploy Tamamlandı!"
echo "========================================"
echo ""
echo "Test Edilmesi Gerekenler:"
echo "  1. Ana sayfada ilanlar görünüyor mu?"
echo "  2. Kategori sayfalarında ilanlar görünüyor mu?"
echo "  3. Resimler düzgün görüntüleniyor mu?"
echo "  4. Base64 resimler çalışıyor mu?"
echo ""

