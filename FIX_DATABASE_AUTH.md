# Veritabanı Kimlik Doğrulama Hatası Çözümü

## 🔍 Sorun
```
Error: P1000: Authentication failed against database server, 
the provided database credentials for `alo17_user` are not valid.
```

## ✅ Çözüm Adımları

### 1. PostgreSQL Kullanıcısını Kontrol Et ve Yeniden Oluştur

```bash
# PostgreSQL'e postgres kullanıcısı ile bağlan
sudo -u postgres psql

# Mevcut kullanıcıyı kontrol et
\du

# Eğer kullanıcı varsa şifresini değiştir
ALTER USER alo17_user WITH PASSWORD '20251973Bscc7319';

# Eğer kullanıcı yoksa oluştur
CREATE USER alo17_user WITH ENCRYPTED PASSWORD '20251973Bscc7319';

# Veritabanına yetki ver
GRANT ALL PRIVILEGES ON DATABASE alo17_db TO alo17_user;

# Schema'ya yetki ver
\c alo17_db
GRANT ALL ON SCHEMA public TO alo17_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO alo17_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO alo17_user;

# Çıkış
\q
```

### 2. .env Dosyasını Kontrol Et ve Güncelle

```bash
cd /var/www/alo17

# Mevcut .env'i kontrol et
cat .env

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
```

### 3. Bağlantıyı Test Et

```bash
# PostgreSQL'e manuel bağlanmayı dene
sudo -u postgres psql -d alo17_db -U alo17_user

# Eğer şifre sorarsa: 20251973Bscc7319
# Başarılı olursa \q ile çık
```

### 4. Prisma Migration'ı Tekrar Dene

```bash
cd /var/www/alo17

# Prisma Client'ı yeniden generate et
npx prisma generate

# Migration'ı uygula
npx prisma db push
```

## 🔧 Alternatif: Şifre Özel Karakter İçeriyorsa

Eğer şifre özel karakterler içeriyorsa (örnek: `@`, `#`, `&`), URL encode etmeniz gerekir:

```bash
# Örnek: Şifre "pass@word" ise
# URL encode: pass%40word
DATABASE_URL="postgresql://alo17_user:pass%40word@localhost:5432/alo17_db?schema=public"
```

## 📝 Tek Komut (Hızlı Çözüm)

```bash
cd /var/www/alo17 && \
sudo -u postgres psql << 'PSQL'
ALTER USER alo17_user WITH PASSWORD '20251973Bscc7319';
GRANT ALL PRIVILEGES ON DATABASE alo17_db TO alo17_user;
\c alo17_db
GRANT ALL ON SCHEMA public TO alo17_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO alo17_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO alo17_user;
\q
PSQL
cat > .env << 'EOF'
DATABASE_URL="postgresql://alo17_user:20251973Bscc7319@localhost:5432/alo17_db?schema=public"
NEXTAUTH_URL="https://alo17.tr"
NEXTAUTH_SECRET="ZJsjIWDL0CCuMmAy2r8by1mQG+S+DVPaMPYcBfAzglw="
NODE_ENV="production"
PORT=3000
GOOGLE_CLIENT_ID="994791867914-6qsiuaag21nqvoms853n9rlkkhub0jap.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
EOF
npx prisma generate && npx prisma db push
```

