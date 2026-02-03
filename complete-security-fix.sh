#!/bin/bash
# Kalan güvenlik düzeltmelerini tamamla

echo "🔒 Kalan güvenlik açıkları düzeltiliyor..."
npm audit fix

echo ""
echo "📦 Next.js güncelleniyor..."
npm install next@latest

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
