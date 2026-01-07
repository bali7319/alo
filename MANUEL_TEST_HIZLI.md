# Manuel Test - Hızlı Özet

## ⚠️ ÖNCE 404 HATASINI DÜZELTİN

```powershell
ssh root@alo17.tr 'cd /var/www/alo17 && rm -rf .next && npm install && npx prisma generate && npm run build && pm2 restart alo17 && pm2 save'
```

Veya:
```powershell
.\FIX_404_BUILD.ps1
```

Build tamamlandıktan sonra tarayıcıda **Ctrl+F5** ile sayfayı yenileyin.

---

## 🎯 MANUEL TEST ADIMLARI

### ADIM 1: Admin Girişi
1. `https://alo17.tr` adresine gidin
2. **Admin hesabıyla giriş yapın**
3. **Header'daki Bell ikonunu (🔔) kontrol edin**
   - Başlangıç bildirim sayısını not edin (örneğin: 0 veya 3)

### ADIM 2: Test İlanı Oluşturma
1. **Yeni bir tarayıcı penceresi açın** (veya gizli mod)
2. `https://alo17.tr` adresine gidin
3. **Normal kullanıcı hesabıyla giriş yapın** (admin değil)
4. `/ilan-ver` sayfasına gidin
5. **Test ilanı oluşturun:**
   - Başlık: `TEST - Yeni İlan Uyarısı`
   - Kategori: Herhangi bir kategori
   - Fiyat: `1000 ₺`
   - Açıklama: `Bu bir test ilanıdır`
6. **İlanı kaydedin**

### ADIM 3: Bildirim Kontrolü (Admin Tarayıcısında)

**A) Header Bildirim İkonu:**
- ✅ Bell ikonunda **kırmızı badge** görünmeli
- ✅ Sayı **artmış** olmalı (örneğin: 0 → 1)

**B) Sesli Uyarı:**
- ✅ Yeni bildirim geldiğinde **800 Hz bip sesi** çalmalı
- ⚠️ İlk yüklemede çalmaz, sadece yeni bildirim geldiğinde çalar

**C) Bildirim Dropdown:**
- Bell ikonuna tıklayın
- ✅ "Yeni İlan Onay Bekliyor" başlıklı bildirim görünmeli
- ✅ Mesaj: "X kullanıcısı 'TEST - Yeni İlan Uyarısı' başlıklı yeni bir ilan oluşturdu..."

**D) Bildirime Tıklama:**
- Bildirime tıklayın
- ✅ Admin panelindeki ilan detay sayfasına yönlendirilmeli
- ✅ Bildirim **okundu** işaretlenmeli (badge sayısı azalmalı)

### ADIM 4: Admin Panel Kontrolü
1. `/admin/ilanlar` sayfasına gidin
2. **"Bekleyen" filtresine tıklayın**
3. ✅ Test ilanını bulun:
   - Başlık: "TEST - Yeni İlan Uyarısı"
   - Durum: "Bekliyor" (sarı badge)

### ADIM 5: Otomatik Yenileme Testi
1. **30 saniye bekleyin**
2. **Yeni bir test ilanı daha oluşturun**
3. ✅ 30 saniye içinde:
   - Bildirim sayacı otomatik güncellenmeli
   - Yeni bildirim geldiğinde **sesli uyarı çalmalı**

---

## ✅ BAŞARILI TEST İÇİN

- [ ] Yeni ilan oluşturulduğunda bildirim oluşturuldu
- [ ] Header'da bildirim sayacı arttı
- [ ] Sesli uyarı çaldı (yeni bildirim geldiğinde)
- [ ] Bildirim dropdown'da görünüyor
- [ ] Bildirime tıklayınca yönlendirme çalışıyor
- [ ] Admin panelinde ilan görünüyor
- [ ] Otomatik yenileme çalışıyor (30 saniye)

---

## ❌ SORUN VARSA

### Bildirim Gelmiyor
```powershell
ssh root@alo17.tr "pm2 logs alo17 --lines 50 --nostream | grep -i 'notification'"
```

### Sesli Uyarı Çalmıyor
- Tarayıcı konsolunu açın (F12)
- Console'da hata var mı kontrol edin
- Tarayıcı ses izni var mı kontrol edin

### Bildirim Sayacı Güncellenmiyor
- Sayfayı yenileyin (F5)
- 30 saniye bekleyin (otomatik yenileme)

---

## 🧹 TEST SONRASI

Test tamamlandıktan sonra:
1. **Test ilanlarını silin** (Admin panelinden)
2. **Test bildirimlerini temizleyin** (opsiyonel)

---

**İyi testler! 🚀**

