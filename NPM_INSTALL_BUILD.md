# npm install ve Build Adımları

## ✅ PostgreSQL Hazır

- ✅ PostgreSQL kuruldu
- ✅ Veritabanı oluşturuldu: `alo17_db`
- ✅ Kullanıcı oluşturuldu: `alo17_user`
- ✅ Yetkiler verildi

## 📦 npm install ve Build

### 1. Bağımlılıkları Kur

```bash
cd /var/www/alo17

# Bağımlılıkları kur
npm install
```

**Not:** Bu işlem biraz zaman alabilir (5-10 dakika).

### 2. Prisma Client Oluştur

```bash
# Prisma client oluştur
npx prisma generate
```

### 3. Veritabanı Migration

```bash
# Veritabanı migration
npx prisma migrate deploy
```

### 4. Build Yap

```bash
# Build yap
npm run build
```

**Not:** Build işlemi de biraz zaman alabilir (3-5 dakika).

## 🎯 Hızlı Komutlar (Kopyala-Yapıştır)

SSH terminal'inde sırayla:

```bash
cd /var/www/alo17
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

## ✅ Kontrol

Build başarılı olduktan sonra:

```bash
# .next klasörü oluştu mu?
ls -la .next

# Build başarılı mı kontrol et
ls -la .next/static
```

## 🚀 Sonraki Adım: PM2 ile Başlat

Build başarılı olduktan sonra PM2 ile uygulamayı başlatacağız.

