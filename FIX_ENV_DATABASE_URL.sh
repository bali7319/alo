#!/bin/bash
# .env dosyasındaki DATABASE_URL'i düzelt

cd /var/www/alo17

# Yedek al
cp .env .env.backup

# Doğru format ile değiştir
cat > .env << 'EOF'
DATABASE_URL="postgresql://alo17_user:20251973Bscc7319@localhost:5432/alo17_db?schema=public"
NEXTAUTH_URL="https://alo17.tr"
NEXTAUTH_SECRET="ZJsjIWDL0CCuMmAy2r8by1mQG+S+DVPaMPYcBfAzglw="
NODE_ENV="production"
PORT=3000
EOF

echo "✅ .env dosyası güncellendi!"
echo ""
echo "Yeni içerik:"
cat .env

