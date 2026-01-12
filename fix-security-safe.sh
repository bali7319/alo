#!/bin/bash
# Güvenli güvenlik düzeltmeleri (breaking changes olmadan)

echo "🔒 Güvenli güvenlik düzeltmeleri yapılıyor..."
npm audit fix

echo ""
echo "📦 Next.js güncelleniyor (15.3.3 -> 15.4.6)..."
npm install next@latest

echo ""
echo "🔧 Build yapılıyor..."
npm run build

echo ""
echo "✅ Güvenli düzeltmeler tamamlandı!"
echo ""
echo "⚠️  Not: Breaking changes gerektiren açıklar için manuel kontrol gerekli:"
echo "   - cookie/@auth/core (next-auth güncellemesi gerekebilir)"
echo "   - glob (eslint-config-next güncellemesi)"
echo "   - nodemailer"
