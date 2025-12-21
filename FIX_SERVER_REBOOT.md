# Sunucu Yeniden Başlatma ve Dosya Yükleme

## Sorun
Sunucu bağlantıları kesiyor - ciddi bellek sorunu var.

## Çözüm: Sunucuyu Yeniden Başlat

### Adım 1: Sunucuyu Yeniden Başlat
SSH ile bağlanabildiğinizde (kısa bir süre için):

```bash
reboot
```

VEYA Natro kontrol panelinden sunucuyu yeniden başlatın.

### Adım 2: Sunucu Açıldıktan Sonra (2-3 dakika bekleyin)

```bash
# Bellek durumunu kontrol et
free -h

# PM2 durumunu kontrol et
pm2 list

# Eğer PM2 çalışmıyorsa
cd /var/www/alo17
pm2 start ecosystem.config.js
pm2 save
```

### Adım 3: Dosyayı Yükle
Sunucu yeniden başladıktan sonra WinSCP ile tekrar bağlanın ve `.next.zip` dosyasını yükleyin.

## Alternatif: Sadece Gerekli Dosyaları Yükle

Eğer hala sorun varsa, `.next` klasörünün sadece kritik dosyalarını yükleyebiliriz.

