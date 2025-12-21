# PM2 Restart Loop Sorunu

## Sorun
Uygulama sürekli yeniden başlatılıyor - Next.js başlamıyor.

## Çözüm Adımları

### 1. Detaylı Log Kontrolü
```bash
pm2 logs alo17 --err --lines 100
```

### 2. Manuel Başlatma Testi
```bash
cd /var/www/alo17
NODE_ENV=production PORT=3000 npm start
```

### 3. .env Dosyasını Kontrol Et
```bash
cat .env
```

### 4. Next.js Build Kontrolü
```bash
ls -lah .next/server/app/page.js
```

### 5. PM2'yi Durdur ve Manuel Test
```bash
pm2 stop alo17
cd /var/www/alo17
npm start
```

