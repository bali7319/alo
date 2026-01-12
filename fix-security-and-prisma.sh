#!/bin/bash
# Güvenlik açıklarını düzelt ve Prisma'yı güncelle

echo "🔍 Güvenlik açıkları kontrol ediliyor..."
npm audit

echo ""
echo "📦 Prisma güncelleniyor (6.10.1 -> 7.2.0)..."
npm install --save-dev prisma@latest
npm install @prisma/client@latest

echo ""
echo "🔧 Prisma Client generate ediliyor..."
npx prisma generate

echo ""
echo "🔒 Güvenlik açıkları düzeltiliyor (breaking changes olmadan)..."
npm audit fix

echo ""
echo "✅ İşlemler tamamlandı!"
echo ""
echo "⚠️  Not: Eğer hala güvenlik açıkları varsa, 'npm audit fix --force' çalıştırabilirsiniz (dikkatli olun, breaking changes olabilir)"
