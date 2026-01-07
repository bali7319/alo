# Manuel Test - Yeni İlan Uyarısı

## 🎯 Test Senaryosu
Yeni bir ilan oluşturulduğunda admin'e bildirim gönderilmesi ve sesli uyarı çalması.

## 📋 Adım Adım Test

### ADIM 1: Admin Girişi ve Başlangıç Kontrolü

1. **Tarayıcıda `https://alo17.tr` adresine gidin**
2. **Admin hesabıyla giriş yapın**
3. **Header'ı kontrol edin:**
   - Sağ üstte kullanıcı menüsü görünmeli
   - Bell ikonu (🔔) görünmeli
   - Eğer okunmamış bildirim varsa, kırmızı badge görünmeli
4. **Bildirim sayısını not edin:**
   - Bell ikonuna tıklayın
   - Kaç tane okunmamış bildirim var, not edin
   - Dropdown'u kapatın

### ADIM 2: Test İlanı Oluşturma

**Yöntem A: Farklı Tarayıcı/Gizli Mod (Önerilen)**
1. **Yeni bir tarayıcı penceresi açın** (veya gizli mod)
2. **`https://alo17.tr` adresine gidin**
3. **Normal bir kullanıcı hesabıyla giriş yapın** (admin değil)
   - Eğer normal kullanıcı yoksa, yeni hesap oluşturun
4. **`/ilan-ver` sayfasına gidin**
5. **Test ilanı oluşturun:**
   ```
   Başlık: TEST - Yeni İlan Uyarısı Testi
   Kategori: Herhangi bir kategori seçin
   Fiyat: 1000 ₺
   Açıklama: Bu bir test ilanıdır. Bildirim sistemini test etmek için oluşturulmuştur.
   Konum: İstanbul (veya herhangi bir şehir)
   ```
6. **İlanı kaydedin ve onay mesajını bekleyin**

**Yöntem B: Aynı Tarayıcıda (Hızlı Test)**
1. Admin panelinden çıkış yapın
2. Normal kullanıcı hesabıyla giriş yapın
3. İlan oluşturun
4. Çıkış yapın ve admin olarak tekrar giriş yapın

### ADIM 3: Bildirim Kontrolü

**Admin tarayıcısında (ADIM 1'deki tarayıcı):**

1. **Header Bildirim İkonu:**
   - Bell ikonunda kırmızı badge görünmeli
   - Sayı artmış olmalı (örneğin: 0 → 1 veya 3 → 4)
   - ✅ **BAŞARILI:** Badge görünüyor ve sayı arttı

2. **Sesli Uyarı:**
   - Yeni bildirim geldiğinde **800 Hz bip sesi** çalmalı
   - Ses 0.2 saniye sürmeli
   - ⚠️ **NOT:** İlk yüklemede çalmaz, sadece yeni bildirim geldiğinde çalar
   - ✅ **BAŞARILI:** Ses çaldı

3. **Bildirim Dropdown:**
   - Bell ikonuna tıklayın
   - Dropdown açılmalı
   - "Yeni İlan Onay Bekliyor" başlıklı bildirim görünmeli
   - Mesaj: "X kullanıcısı 'TEST - Yeni İlan Uyarısı Testi' başlıklı yeni bir ilan oluşturdu. İlan onayınızı bekliyor."
   - Bildirim **okunmamış** (gri/renkli) görünmeli
   - ✅ **BAŞARILI:** Bildirim görünüyor

4. **Bildirime Tıklama:**
   - Bildirime tıklayın
   - Admin panelindeki ilan detay sayfasına yönlendirilmeli
   - Veya `/admin/ilanlar?status=pending` sayfasına gitmeli
   - Bildirim **okundu** işaretlenmeli (badge sayısı azalmalı)
   - ✅ **BAŞARILI:** Yönlendirme çalışıyor

### ADIM 4: Admin Panel Kontrolü

1. **`/admin/ilanlar` sayfasına gidin**
2. **"Bekleyen" filtresine tıklayın** (veya `?status=pending` URL'ine gidin)
3. **Test ilanını bulun:**
   - Başlık: "TEST - Yeni İlan Uyarısı Testi"
   - Durum: "Bekliyor" (sarı badge)
   - Kullanıcı bilgileri görünmeli
4. **İlan detaylarını kontrol edin:**
   - İlan bilgileri doğru mu?
   - Kullanıcı bilgileri doğru mu?
   - ✅ **BAŞARILI:** İlan görünüyor

### ADIM 5: Otomatik Yenileme Testi

1. **Admin tarayıcısında bekleyin** (30 saniye)
2. **Yeni bir test ilanı daha oluşturun** (ADIM 2'yi tekrarlayın)
3. **30 saniye içinde:**
   - Bildirim sayacı otomatik güncellenmeli
   - Yeni bildirim geldiğinde sesli uyarı çalmalı
   - ✅ **BAŞARILI:** Otomatik yenileme çalışıyor

### ADIM 6: Email Bildirimi Kontrolü (Opsiyonel)

1. **PM2 loglarını kontrol edin:**
   ```powershell
   ssh root@alo17.tr "pm2 logs alo17 --lines 50 --nostream | grep -i 'email\|bildirim'"
   ```
2. **Console'da şu mesajı görmelisiniz:**
   ```
   Email bildirimi gönderildi (simüle): Yeni İlan Onay Bekliyor
   ```
3. ✅ **BAŞARILI:** Email bildirimi simüle edildi

## ✅ Test Sonuçları

### Başarılı Test İçin:
- [ ] Yeni ilan oluşturulduğunda bildirim oluşturuldu
- [ ] Header'da bildirim sayacı arttı
- [ ] Sesli uyarı çaldı (yeni bildirim geldiğinde)
- [ ] Bildirim dropdown'da görünüyor
- [ ] Bildirime tıklayınca yönlendirme çalışıyor
- [ ] Admin panelinde ilan görünüyor
- [ ] Otomatik yenileme çalışıyor (30 saniye)
- [ ] Email bildirimi simüle edildi (console.log)

## ❌ Sorun Giderme

### Bildirim Gelmiyor
1. **PM2 loglarını kontrol edin:**
   ```powershell
   ssh root@alo17.tr "pm2 logs alo17 --lines 50 --nostream"
   ```
2. **Database'de notification var mı kontrol edin:**
   ```powershell
   ssh root@alo17.tr "cd /var/www/alo17 && npx prisma studio"
   ```
3. **Admin email doğru mu kontrol edin:**
   - `src/lib/admin.ts` dosyasında `getAdminEmail()` fonksiyonu

### Sesli Uyarı Çalmıyor
1. **Tarayıcı konsolunu açın** (F12)
2. **Console'da hata var mı kontrol edin**
3. **Tarayıcı ses izni var mı kontrol edin**
4. **Web Audio API destekleniyor mu kontrol edin:**
   - Chrome, Firefox, Edge: ✅ Desteklenir
   - Safari: ⚠️ Kısmen desteklenir

### Bildirim Sayacı Güncellenmiyor
1. **Sayfayı yenileyin** (F5)
2. **30 saniye bekleyin** (otomatik yenileme)
3. **API endpoint'i çalışıyor mu kontrol edin:**
   ```powershell
   Invoke-WebRequest -Uri "https://alo17.tr/api/notifications" -Method GET -UseBasicParsing
   ```

## 🧹 Test Sonrası Temizlik

Test tamamlandıktan sonra:
1. **Test ilanlarını silin:**
   - Admin panelinden test ilanlarını bulun
   - "Sil" butonuna tıklayın
2. **Test bildirimlerini temizleyin (opsiyonel):**
   - Database'den test bildirimlerini silebilirsiniz

## 📊 Test Raporu

Test sonuçlarını not edin:
- ✅ Başarılı testler
- ❌ Başarısız testler
- ⚠️ Sorunlar ve çözümler

---

**İyi testler! 🚀**

