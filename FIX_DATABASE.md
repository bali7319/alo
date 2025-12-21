# Veritabanı Bağlantı Sorunu Çözümü

## ❌ Sorun
Prisma hala SQLite kullanıyor:
```
Datasource "db": SQLite database "dev.db" at "file:./dev.db"
```

## ✅ Çözüm

### 1. .env Dosyasını Kontrol Et
```bash
cd /var/www/alo17
cat .env
```

### 2. DATABASE_URL'i PostgreSQL'e Güncelle
```bash
nano .env
```

**Doğru format:**
```env
DATABASE_URL="postgresql://alo17_user:güçlü-şifre-buraya@localhost:5432/alo17_db?schema=public"
```

**ÖNEMLİ**: Daha önce PostgreSQL'de oluşturduğunuz şifreyi kullanın!

### 3. Prisma Schema'yı Kontrol Et
```bash
cat prisma/schema.prisma | grep -A 3 "datasource"
```

Şöyle olmalı:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Prisma Client'ı Yeniden Generate Et
```bash
npx prisma generate
```

### 5. PostgreSQL'e Migration Uygula
```bash
npx prisma migrate deploy
```

### 6. Veritabanı Bağlantısını Test Et
```bash
npx prisma db pull
```

## 🔍 Sorun Giderme

### Eğer migration hatası alırsanız:
```bash
# Migration'ları sıfırdan oluştur
npx prisma migrate dev --name init_postgresql
```

### Eğer veritabanı bağlantı hatası alırsanız:
```bash
# PostgreSQL servisini kontrol et
systemctl status postgresql

# PostgreSQL'e manuel bağlan
sudo -u postgres psql -d alo17_db -U alo17_user
```

### Şifreyi unuttuysanız:
```bash
sudo -u postgres psql
ALTER USER alo17_user WITH PASSWORD 'yeni-şifre';
\q
```

Sonra .env dosyasını güncelleyin.

