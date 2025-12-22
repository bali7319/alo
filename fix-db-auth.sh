#!/bin/bash
# Veritabanı kimlik doğrulama hatasını düzelt

cd /var/www/alo17

echo "🔧 PostgreSQL kullanıcısını güncelleniyor..."

# PostgreSQL kullanıcısını güncelle
sudo -u postgres psql << 'PSQL'
-- Kullanıcıyı oluştur veya şifresini güncelle
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_user WHERE usename = 'alo17_user') THEN
        ALTER USER alo17_user WITH PASSWORD '20251973Bscc7319';
    ELSE
        CREATE USER alo17_user WITH ENCRYPTED PASSWORD '20251973Bscc7319';
    END IF;
END
$$;

-- Veritabanı yetkilerini ver
GRANT ALL PRIVILEGES ON DATABASE alo17_db TO alo17_user;

-- Schema yetkilerini ver
\c alo17_db
GRANT ALL ON SCHEMA public TO alo17_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO alo17_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO alo17_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO alo17_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO alo17_user;
\q
PSQL

echo "✅ PostgreSQL kullanıcısı güncellendi!"
echo ""
echo "📝 .env dosyası güncelleniyor..."

# .env dosyasını güncelle
cat > .env << 'EOF'
DATABASE_URL="postgresql://alo17_user:20251973Bscc7319@localhost:5432/alo17_db?schema=public"
NEXTAUTH_URL="https://alo17.tr"
NEXTAUTH_SECRET="ZJsjIWDL0CCuMmAy2r8by1mQG+S+DVPaMPYcBfAzglw="
NODE_ENV="production"
PORT=3000
GOOGLE_CLIENT_ID="994791867914-6qsiuaag21nqvoms853n9rlkkhub0jap.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
EOF

echo "✅ .env dosyası güncellendi!"
echo ""
echo "🔄 Prisma migration uygulanıyor..."

# Prisma migration
npx prisma generate
npx prisma db push

echo ""
echo "✅ Tamamlandı!"

