# Yerel Makinede Build Yapıp Sunucuya Yükleme

## ✅ Çözüm: Build'i Yerel Makinede Yap

Sunucuda bellek yetersiz, bu yüzden build'i yerel makinede yapıp sunucuya yükleyelim.

### 1. Yerel Makinede (Windows PowerShell)

```powershell
# Proje dizinine git
cd C:\Users\bali\Desktop\alo

# Build yap
npm run build

# .next klasörünü sıkıştır
tar -czf build.tar.gz .next

# Sunucuya yükle
scp build.tar.gz root@alo17.tr:/var/www/alo17/
```

### 2. Sunucuda

```bash
# PM2'yi tamamen kapat
pm2 kill

# Build dosyasını aç
cd /var/www/alo17
tar -xzf build.tar.gz

# PM2'yi tekrar başlat
pm2 start ecosystem.config.js
pm2 save
```

## Alternatif: Sunucuda Düşük Bellek ile Build

Eğer yerel build yapamıyorsanız:

```bash
# PM2'yi kapat
pm2 kill

# Çok düşük bellek limiti ile dene
cd /var/www/alo17
NODE_OPTIONS="--max-old-space-size=1024" npm run build

# PM2'yi başlat
pm2 start ecosystem.config.js
pm2 save
```

