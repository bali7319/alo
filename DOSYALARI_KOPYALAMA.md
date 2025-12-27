# Dosyaları Yerelden Sunucuya Kopyalama

## ✅ Klasör Hazır

Klasör başarıyla oluşturuldu: `/var/www/alo17`

## 📦 Dosyaları Kopyalama Yöntemleri

### Yöntem 1: WinSCP ile (ÖNERİLEN - En Kolay)

1. **WinSCP'yi açın**
2. **Sunucuya bağlanın:**
   - Host: `alo17.tr`
   - Port: `22`
   - User: `root`
   - Password: (yeni şifreniz)

3. **Dosyaları kopyala:**
   - **Sol tarafta:** `C:\Users\bali\Desktop\alo`
   - **Sağ tarafta:** `/var/www/alo17`
   - **Tüm klasörleri seç** (Ctrl+A veya manuel seç)
   - **Sürükle-bırak** ile kopyala

4. **ÖNEMLİ - ATLAMANIZ GEREKENLER:**
   - ❌ `node_modules/` - Sunucuda kurulacak
   - ❌ `.next/` - Sunucuda build edilecek
   - ❌ `.env` - Sunucuda oluşturulacak
   - ❌ `.git/` - Gerekli değil

5. **Kopyalanması Gerekenler:**
   - ✅ `src/` - Tüm kaynak kodlar
   - ✅ `prisma/` - Veritabanı schema
   - ✅ `public/` - Statik dosyalar
   - ✅ `package.json` - Bağımlılıklar
   - ✅ `package-lock.json` - Bağımlılık kilidi
   - ✅ `next.config.js` - Next.js ayarları
   - ✅ `tsconfig.json` - TypeScript ayarları
   - ✅ `tailwind.config.js` - Tailwind ayarları
   - ✅ `postcss.config.js` - PostCSS ayarları
   - ✅ `ecosystem.config.js` - PM2 ayarları

### Yöntem 2: PowerShell SCP ile

**Yeni bir PowerShell penceresi açın** (SSH terminal'i açık kalsın):

```powershell
# Yerel klasöre git
cd C:\Users\bali\Desktop\alo

# Tüm src klasörünü kopyala
scp -r src root@alo17.tr:/var/www/alo17/

# Prisma klasörünü kopyala
scp -r prisma root@alo17.tr:/var/www/alo17/

# Public klasörünü kopyala
scp -r public root@alo17.tr:/var/www/alo17/

# Config dosyalarını kopyala
scp package.json root@alo17.tr:/var/www/alo17/
scp package-lock.json root@alo17.tr:/var/www/alo17/
scp next.config.js root@alo17.tr:/var/www/alo17/
scp tsconfig.json root@alo17.tr:/var/www/alo17/
scp tailwind.config.js root@alo17.tr:/var/www/alo17/
scp postcss.config.js root@alo17.tr:/var/www/alo17/
scp ecosystem.config.js root@alo17.tr:/var/www/alo17/
```

## ✅ Kopyalama Sonrası Kontrol

SSH terminal'inde:

```bash
cd /var/www/alo17

# Dosyalar kopyalandı mı kontrol et
ls -la

# Önemli klasörler var mı?
ls -la src/
ls -la prisma/
ls -la public/

# Dosya sayısını kontrol et
find src -type f | wc -l
```

## 📝 Notlar

- **WinSCP en kolay yöntemdir** - Sürükle-bırak ile hızlı kopyalama
- **SCP daha yavaş** ama komut satırından yapılabilir
- **node_modules kopyalamayın** - Sunucuda `npm install` ile kurulacak
- **Büyük dosyalar için zaman alabilir** - Sabırlı olun

