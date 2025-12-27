# WinSCP ile Deployment - Detaylı Rehber

## 📋 Adım Adım WinSCP Kullanımı

### 1. WinSCP'yi Açın ve Bağlanın

1. **WinSCP programını açın**
2. **Yeni bir oturum oluşturun:**
   - **Dosya Protokolü:** SFTP
   - **Ana Bilgisayar Adı:** `alo17.tr` (veya sunucu IP adresiniz)
   - **Port Numarası:** `22`
   - **Kullanıcı Adı:** `root`
   - **Parola:** (sunucu şifreniz)
   - **Oturumu Kaydet** kutusunu işaretleyin
   - **Oturum** butonuna tıklayın

3. **İlk bağlantıda güvenlik uyarısı çıkarsa:**
   - "Evet" veya "Yes" butonuna tıklayın
   - Sunucunun parmak izini kaydedin

### 2. WinSCP Arayüzü

WinSCP açıldığında iki panel görürsünüz:

```
┌─────────────────────┬─────────────────────┐
│   YEREL BİLGİSAYAR  │   SUNUCU (alo17.tr) │
│   (Sol Panel)       │   (Sağ Panel)        │
│                     │                     │
│   C:\Users\bali\    │   /var/www/alo17    │
│   Desktop\alo       │                     │
└─────────────────────┴─────────────────────┘
```

### 3. Sol Panel - Yerel Klasörü Açın

1. **Sol panelde** (Yerel Bilgisayar) şu klasöre gidin:
   ```
   C:\Users\bali\Desktop\alo
   ```

2. **Klasör yapısını görmelisiniz:**
   ```
   📁 alo
   ├── 📁 src
   │   ├── 📁 app
   │   │   ├── 📁 api
   │   │   └── ...
   │   ├── 📁 lib
   │   │   └── prisma.ts  ⭐ (GÜNCELLENMİŞ)
   │   └── ...
   ├── 📁 prisma
   ├── 📁 public
   └── ...
   ```

### 4. Sağ Panel - Sunucu Klasörüne Gidin

1. **Sağ panelde** (Sunucu) şu klasöre gidin:
   ```
   /var/www/alo17
   ```

2. **Klasör yapısını görmelisiniz:**
   ```
   📁 /var/www/alo17
   ├── 📁 src
   │   ├── 📁 app
   │   │   ├── 📁 api
   │   │   └── ...
   │   ├── 📁 lib
   │   └── ...
   ├── 📁 prisma
   ├── 📁 public
   └── ...
   ```

### 5. Güncellenmiş Dosyaları Yükleyin

#### ⚠️ ÖNEMLİ: Sadece Değişen Dosyaları Yükleyin

Aşağıdaki dosya ve klasörleri **sürükle-bırak** ile yükleyin:

#### 5.1. src/lib/prisma.ts Dosyası

1. **Sol panelde:** `src/lib/prisma.ts` dosyasını bulun
2. **Sağ panelde:** `src/lib/` klasörüne gidin
3. **prisma.ts dosyasını** sol panelden sağ panele **sürükleyip bırakın**
4. **Üzerine yaz** uyarısı gelirse **"Evet"** deyin

#### 5.2. src/lib/auth.ts Dosyası

1. **Sol panelde:** `src/lib/auth.ts` dosyasını bulun
2. **Sağ panelde:** `src/lib/` klasörüne gidin
3. **auth.ts dosyasını** sol panelden sağ panele **sürükleyip bırakın**
4. **Üzerine yaz** uyarısı gelirse **"Evet"** deyin

#### 5.3. src/app/api/ Klasörü (Tüm API Route'ları)

1. **Sol panelde:** `src/app/api/` klasörünü bulun
2. **Sağ panelde:** `src/app/` klasörüne gidin
3. **api klasörünü** sol panelden sağ panele **sürükleyip bırakın**
4. **Üzerine yaz** uyarısı gelirse **"Evet"** deyin
5. **Alt klasörler dahil** seçeneğini işaretleyin

#### 5.4. src/app/sitemap.ts Dosyası

1. **Sol panelde:** `src/app/sitemap.ts` dosyasını bulun
2. **Sağ panelde:** `src/app/` klasörüne gidin
3. **sitemap.ts dosyasını** sol panelden sağ panele **sürükleyip bırakın**

#### 5.5. src/app/kategori/ Klasörü

1. **Sol panelde:** `src/app/kategori/` klasörünü bulun
2. **Sağ panelde:** `src/app/` klasörüne gidin
3. **kategori klasörünü** sol panelden sağ panele **sürükleyip bırakın**
4. **Alt klasörler dahil** seçeneğini işaretleyin

#### 5.6. src/app/ilan/[id]/page.tsx Dosyası

1. **Sol panelde:** `src/app/ilan/[id]/page.tsx` dosyasını bulun
2. **Sağ panelde:** `src/app/ilan/[id]/` klasörüne gidin
3. **page.tsx dosyasını** sol panelden sağ panele **sürükleyip bırakın**

### 6. Alternatif: Toplu Yükleme (Hızlı Yöntem)

Eğer tüm `src` klasörünü güncellemek isterseniz:

1. **Sol panelde:** `src` klasörünü seçin
2. **Sağ panelde:** `/var/www/alo17/` klasörüne gidin
3. **src klasörünü** sol panelden sağ panele **sürükleyip bırakın**
4. **Üzerine yaz** uyarısı gelirse **"Evet"** deyin
5. **Alt klasörler dahil** seçeneğini işaretleyin

⚠️ **NOT:** Bu yöntem daha uzun sürebilir ama tüm değişiklikleri yükler.

### 7. Yükleme İşlemi Kontrolü

Yükleme tamamlandıktan sonra:

1. **Sağ panelde** dosyaların güncellendiğini kontrol edin
2. **Dosya tarihlerini** kontrol edin (yeni yüklenen dosyalar bugünün tarihini göstermeli)

### 8. WinSCP'den Sonra - Sunucuda Build ve Restart

WinSCP ile dosyaları yükledikten sonra, **SSH terminal** açıp şu komutları çalıştırın:

```bash
# Sunucuya SSH ile bağlanın
ssh root@alo17.tr

# Proje klasörüne gidin
cd /var/www/alo17

# Build yapın (3-5 dakika sürebilir)
npm run build

# PM2'yi yeniden başlatın
pm2 restart alo17

# Durumu kontrol edin
pm2 status
pm2 logs alo17 --lines 20
```

### 9. WinSCP İpuçları

#### Hızlı Erişim:
- **F5:** Yenile
- **F9:** Terminal aç (SSH terminal)
- **Ctrl+P:** Tercihler

#### Dosya Seçimi:
- **Ctrl+A:** Tümünü seç
- **Ctrl+Click:** Çoklu seçim
- **Shift+Click:** Aralık seçimi

#### Kopyalama:
- **Sürükle-Bırak:** Dosya/klasör kopyala
- **F5:** Kopyala (menüden)
- **F6:** Taşı (menüden)

### 10. Sorun Giderme

#### "Erişim Reddedildi" Hatası:
- Kullanıcı adı ve şifrenizi kontrol edin
- Sunucu IP adresini kontrol edin
- Port 22'nin açık olduğundan emin olun

#### "Dosya Bulunamadı" Hatası:
- Sol panelde doğru klasörde olduğunuzdan emin olun
- Dosya adlarını kontrol edin (büyük/küçük harf duyarlı)

#### Yükleme Yavaş:
- Büyük dosyalar (node_modules, .next) yüklemeyin
- Sadece değişen dosyaları yükleyin

### 11. Yüklenmesi Gereken Dosyalar Özeti

```
✅ src/lib/prisma.ts
✅ src/lib/auth.ts
✅ src/app/api/ (tüm klasör)
✅ src/app/sitemap.ts
✅ src/app/kategori/ (tüm klasör)
✅ src/app/ilan/[id]/page.tsx
```

### 12. Yüklenmemesi Gerekenler

```
❌ node_modules/ (sunucuda npm install yapılacak)
❌ .next/ (sunucuda build yapılacak)
❌ .env (sunucuda zaten var)
❌ .git/ (gerekli değil)
❌ prisma/dev.db (SQLite dosyası, production'da kullanılmaz)
```

---

## 🎯 Hızlı Başlangıç (Özet)

1. WinSCP'yi aç → `root@alo17.tr` bağlan
2. Sol: `C:\Users\bali\Desktop\alo`
3. Sağ: `/var/www/alo17`
4. `src` klasörünü sürükle-bırak
5. SSH terminal aç (F9)
6. `cd /var/www/alo17 && npm run build && pm2 restart alo17`

---

**Hazır! Artık dosyalarınız sunucuda. 🚀**

