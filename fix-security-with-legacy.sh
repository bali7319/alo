#!/bin/bash
# Güvenlik düzeltmeleri --legacy-peer-deps ile

echo "📦 Nodemailer güncelleniyor..."
npm install nodemailer@^7.0.12 --legacy-peer-deps

echo ""
echo "🔒 Güvenlik açıkları düzeltiliyor..."
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
echo "✅ Güvenlik düzeltmeleri tamamlandı!"
