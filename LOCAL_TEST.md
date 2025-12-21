# Yerel Test ve Geliştirme

## Yerel Sunucuyu Başlat
```powershell
cd C:\Users\bali\Desktop\alo
npm run dev
```

Tarayıcıda `http://localhost:3000` adresine gidin.

## Yerel .env Dosyası
`.env` dosyanızda şunlar olmalı:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
NODE_ENV="development"
```

## Sunucu Sorunları Çözüldükten Sonra
1. Natro panelden sunucuyu yeniden başlatın
2. SSH bağlantısını tekrar deneyin
3. PM2'yi kontrol edin ve gerekirse başlatın

