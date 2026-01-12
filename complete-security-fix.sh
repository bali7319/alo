#!/bin/bash
# Kalan güvenlik düzeltmelerini tamamla

echo "🔒 Kalan güvenlik açıkları düzeltiliyor..."
npm audit fix --legacy-peer-deps

echo ""
echo "📦 Next.js güncelleniyor..."
npm install next@latest --legacy-peer-deps

echo ""
echo "🔧 Prisma Client generate ediliyor..."
npx prisma generate

echo ""
echo "🏗️  Build yapılıyor..."
npm run build

echo ""
echo "🔄 PM2 restart ediliyor..."
pm2 restart alo17

echo ""
echo "✅ Tüm güvenlik düzeltmeleri tamamlandı!"
