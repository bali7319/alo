#!/bin/bash
# Google OAuth Environment Variables Kontrolü

echo "🔍 Google OAuth Environment Variables kontrol ediliyor..."
echo ""

ssh root@alo17.tr << 'EOF'
cd /var/www/alo17

echo "📋 .env dosyası içeriği (gizli bilgiler maskelenmiş):"
echo ""

if [ -f .env ]; then
    cat .env | grep -E "NEXTAUTH_URL|GOOGLE_CLIENT" | sed 's/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=***MASKED***/' | sed 's/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=***MASKED***/'
else
    echo "❌ .env dosyası bulunamadı!"
fi

echo ""
echo "✅ Kontrol tamamlandı!"
EOF

