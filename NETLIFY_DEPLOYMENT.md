# Netlify Deployment Guide - Alo17

Bu rehber Alo17 projesini Netlify'a deploy etmek için hazırlanmıştır.

## 🚀 Hızlı Başlangıç

### 1. Netlify CLI Kurulumu
```bash
npm install -g netlify-cli
```

### 2. Netlify'da Giriş Yapın
```bash
netlify login
```

### 3. Projeyi Deploy Edin
```bash
# Build işlemi
npm run build

# Deploy
netlify deploy --prod --dir=out
```

## 📋 Manuel Deploy Adımları

### 1. GitHub'a Push
```bash
git add .
git commit -m "Netlify deployment ready"
git push origin main
```

### 2. Netlify Dashboard'da Deploy
1. [Netlify Dashboard](https://app.netlify.com)'a gidin
2. "New site from Git" seçin
3. GitHub repository'nizi seçin
4. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
   - **Node version**: `18`

### 3. Environment Variables Ayarlayın
Site settings > Environment variables bölümünde şunları ekleyin:

```
NEXTAUTH_URL=https://your-site-name.netlify.app
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=file:./dev.db
```

## 🔧 Konfigürasyon Dosyaları

### netlify.toml
- Build komutları
- Redirect kuralları
- Cache headers
- Security headers

### next.config.js
- Static export ayarları
- Image optimization
- Redirect kuralları

## 🐛 Yaygın Sorunlar

### Build Hatası
```bash
# Node modules'ı temizle
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Prisma Hatası
```bash
# Prisma client'ı yeniden generate et
npx prisma generate
```

### Image Loading Hatası
- `next.config.js`'de `unoptimized: true` ayarlandı
- Remote patterns eklendi

## 📊 Performance Optimizasyonu

### Cache Headers
- Static dosyalar için 1 yıl cache
- Images için immutable cache
- JS/CSS için immutable cache

### Build Optimizasyonu
- Legacy peer deps kullanımı
- Prisma generate build sırasında
- Static export ile hızlı loading

## 🔒 Güvenlik

### Security Headers
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## 📱 Domain Ayarları

### Custom Domain
1. Netlify Dashboard > Domain settings
2. "Add custom domain" seçin
3. DNS ayarlarını yapın

### SSL Certificate
- Netlify otomatik SSL sağlar
- Custom domain için de otomatik

## 🔄 Continuous Deployment

### GitHub Integration
- Her push'ta otomatik deploy
- Branch deploy'ları
- Preview deploy'ları

### Build Hooks
- Manuel deploy için webhook
- External CI/CD entegrasyonu

## 📞 Destek

Sorun yaşarsanız:
1. Netlify build loglarını kontrol edin
2. Environment variables'ları doğrulayın
3. Node.js versiyonunu kontrol edin
4. Prisma schema'yı kontrol edin 