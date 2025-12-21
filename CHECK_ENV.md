# .env Dosyası Kontrolü

## 🔍 Kontrol Et

```bash
cd /var/www/alo17
cat .env
```

## ❌ Yanlış Format (SQLite)
```env
DATABASE_URL="file:./dev.db"
```

## ✅ Doğru Format (PostgreSQL)
```env
DATABASE_URL="postgresql://alo17_user:şifre-buraya@localhost:5432/alo17_db?schema=public"
```

## 🔧 Düzeltme

```bash
nano .env
```

Tüm içerik şöyle olmalı:
```env
DATABASE_URL="postgresql://alo17_user:güçlü-şifre-buraya@localhost:5432/alo17_db?schema=public"
NEXTAUTH_URL="https://alo17.tr"
NEXTAUTH_SECRET="ZJsjIWDL0CCuMmAy2r8by1mQG+S+DVPaMPYcBfAzglw="
NODE_ENV="production"
PORT=3000
```

**ÖNEMLİ**: 
- `güçlü-şifre-buraya` yerine PostgreSQL'de oluşturduğunuz gerçek şifreyi yazın
- Şifre özel karakterler içeriyorsa URL encode edin (örnek: `@` → `%40`)

