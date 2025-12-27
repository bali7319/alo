# PostgreSQL Kurulumu

## 🔍 PostgreSQL Kontrolü

```bash
# PostgreSQL kurulu mu?
which psql
psql --version

# PostgreSQL servisi çalışıyor mu?
systemctl status postgresql
```

## 📦 PostgreSQL Kurulumu

### 1. PostgreSQL Kur

```bash
# Sistem güncellemesi
apt update

# PostgreSQL kur
apt install -y postgresql postgresql-contrib

# PostgreSQL servisini başlat
systemctl start postgresql
systemctl enable postgresql

# Durum kontrolü
systemctl status postgresql
```

### 2. PostgreSQL Kullanıcısı Oluştur

```bash
# PostgreSQL'e bağlan (root olarak)
sudo -u postgres psql

# VEYA direkt psql ile
psql -U postgres
```

### 3. Veritabanı ve Kullanıcı Oluştur

PostgreSQL shell'de:

```sql
-- Veritabanı oluştur
CREATE DATABASE alo17_db;

-- Kullanıcı oluştur
CREATE USER alo17_user WITH ENCRYPTED PASSWORD '20251973Bscc20251973Bscc20251973Bscc20251973';

-- Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE alo17_db TO alo17_user;

-- Schema yetkisi ver
\c alo17_db
GRANT ALL ON SCHEMA public TO alo17_user;

-- Çıkış
\q
```

## ✅ Alternatif: SQLite Kullan (Daha Kolay)

Eğer PostgreSQL kurmak istemiyorsanız, SQLite kullanabilirsiniz:

### .env Dosyasını Güncelle

```bash
nano .env
```

DATABASE_URL satırını değiştirin:

```
DATABASE_URL="file:./prisma/dev.db"
```

### Prisma Schema'yı Güncelle

```bash
nano prisma/schema.prisma
```

`datasource db` kısmını değiştirin:

```
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

## 🎯 Hızlı Komutlar

```bash
# PostgreSQL kur
apt update
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# PostgreSQL'e bağlan
sudo -u postgres psql
```

