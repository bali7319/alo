# Reklam Ver Butonu Deploy

## 📦 Değişen Dosya

- `src/app/page.tsx` - Reklam Ver butonu kategorilerin üstünde (satır 110-118)

## 🚀 Deploy Komutları

### 1. Dosyayı Sunucuya Aktar

```powershell
cd C:\Users\bali\Desktop\alo
scp src/app/page.tsx root@alo17.tr:/var/www/alo17/src/app/page.tsx
```

### 2. Sunucuda Build ve Restart

```bash
ssh root@alo17.tr
cd /var/www/alo17
rm -rf .next
npm run build
pm2 restart alo17
```

## ✅ Kontrol

1. Anasayfayı aç: `http://alo17.tr`
2. Kategorilerin üstünde turuncu "Reklam Ver" butonunu gör
3. Butona tıkla ve `/ilan-ver` sayfasına yönlendirildiğini kontrol et

