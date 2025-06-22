# Netlify Environment Variables

Bu dosya Netlify'da ayarlanması gereken environment variables'ları listeler.

## Gerekli Environment Variables

### Database
```
DATABASE_URL="file:./dev.db"
```

### NextAuth
```
NEXTAUTH_URL="https://your-site-name.netlify.app"
NEXTAUTH_SECRET="your-secret-key-here"
```

### OAuth Providers (Opsiyonel)
```
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"
```

### Payment (Opsiyonel)
```
PAYTR_MERCHANT_ID="your-paytr-merchant-id"
PAYTR_MERCHANT_KEY="your-paytr-merchant-key"
PAYTR_MERCHANT_SALT="your-paytr-merchant-salt"
```

## Netlify'da Ayarlama

1. Netlify Dashboard'a gidin
2. Projenizi seçin
3. Site settings > Environment variables
4. Yukarıdaki değişkenleri ekleyin

## Önemli Notlar

- `NEXTAUTH_URL` production URL'iniz olmalı
- `NEXTAUTH_SECRET` güçlü bir rastgele string olmalı
- Database URL'i production'da farklı olabilir
- OAuth provider'ları sadece kullanıyorsanız ekleyin 