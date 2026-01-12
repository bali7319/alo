# Güvenlik Açıkları ve Prisma Güncellemesi

## Güvenlik Açıklarını Düzeltme

### 1. Önce Durumu Kontrol Edin
```bash
npm audit
```

### 2. Breaking Changes Olmadan Düzeltme
```bash
npm audit fix
```

### 3. Tüm Açıkları Düzeltme (Dikkatli!)
```bash
npm audit fix --force
```
⚠️ **Uyarı:** `--force` kullanmak breaking changes'e neden olabilir. Önce test edin!

## Prisma Güncellemesi (6.10.1 → 7.2.0)

### 1. Prisma'yı Güncelle
```bash
npm install --save-dev prisma@latest
npm install @prisma/client@latest
```

### 2. Prisma Client'ı Yeniden Generate Et
```bash
npx prisma generate
```

### 3. Migration Kontrolü
```bash
npx prisma migrate dev
```

### 4. Build ve Test
```bash
npm run build
npm run dev  # Test için
```

## Tek Komutla Tüm İşlemler

Sunucuda çalıştırın:
```bash
cd /var/www/alo17 && npm audit fix && npm install --save-dev prisma@latest && npm install @prisma/client@latest && npx prisma generate && npm run build && pm2 restart alo17
```

## Önemli Notlar

1. **Prisma 7.x Major Update:** 
   - Migration gerekebilir
   - Breaking changes olabilir
   - [Prisma Migration Guide](https://www.prisma.io/docs/guides/upgrade-guides) kontrol edin

2. **Güvenlik Açıkları:**
   - Önce `npm audit` ile kontrol edin
   - `npm audit fix` ile güvenli düzeltmeleri yapın
   - Kritik açıklar için manuel kontrol gerekebilir

3. **Test:**
   - Güncellemelerden sonra mutlaka test edin
   - Production'a geçmeden önce staging'de test edin
