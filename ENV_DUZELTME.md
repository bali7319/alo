# .env Dosyası Düzeltme

## ⚠️ DATABASE_URL Düzeltilmesi Gerekiyor

Mevcut DATABASE_URL'de şifre kısmı eksik. Düzeltin:

```bash
nano .env
```

DATABASE_URL satırını şu şekilde düzeltin:

```
DATABASE_URL="postgresql://alo17_user:20251973Bscc20251973Bscc20251973@localhost:5432/alo17_db?schema=public"
```

**Önemli:** Şifre kısmından sonra `@localhost:5432/alo17_db?schema=public` eklenmeli.

## ✅ Doğru Format

```
DATABASE_URL="postgresql://kullanici_adi:şifre@localhost:5432/veritabani_adi?schema=public"
```

## 📝 Tam .env İçeriği

```
DATABASE_URL="postgresql://alo17_user:20251973Bscc20251973Bscc20251973@localhost:5432/alo17_db?schema=public"
NEXTAUTH_URL="https://alo17.tr"
NEXTAUTH_SECRET="RVzQkgvak8fQmB9Mgc1Y9xH4Y81yjNHG+HDod1TtEws="
NODE_ENV="production"
PORT=3000
```

