# Yeni İlan Uyarısı Test Rehberi

## 🎯 Test Senaryosu

Yeni bir ilan oluşturulduğunda admin'e bildirim gönderilmesi ve sesli uyarı çalması.

## 📋 Test Adımları

### 1. Deploy Kontrolü
Önce tüm dosyaların deploy edildiğinden emin olun:
```powershell
.\DEPLOY_TOPLU.ps1
```

### 2. Admin Girişi
1. Tarayıcıda `https://alo17.tr` adresine gidin
2. Admin hesabıyla giriş yapın
3. Header'da bildirim ikonunu (🔔) kontrol edin
4. Şu anki okunmamış bildirim sayısını not edin

### 3. Test İlanı Oluşturma
**Yöntem 1: Normal Kullanıcı Hesabı ile**
1. Farklı bir tarayıcı veya gizli mod açın
2. Normal bir kullanıcı hesabıyla giriş yapın (admin değil)
3. `/ilan-ver` sayfasına gidin
4. Yeni bir test ilanı oluşturun:
   - Başlık: "TEST - Yeni İlan Uyarısı Testi"
   - Kategori: Herhangi bir kategori
   - Fiyat: 1000 ₺
   - Açıklama: "Bu bir test ilanıdır"
   - İlanı kaydedin

**Yöntem 2: API ile (Hızlı Test)**
```bash
# Test için API endpoint'ini kullanabilirsiniz
curl -X POST https://alo17.tr/api/listings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "TEST - Yeni İlan Uyarısı",
    "category": "test",
    "price": 1000,
    "description": "Test ilanı"
  }'
```

### 4. Bildirim Kontrolü
Admin tarayıcısında:

1. **Header Bildirim İkonu:**
   - Bell ikonunda kırmızı badge görünmeli
   - Sayı artmış olmalı

2. **Sesli Uyarı:**
   - Yeni bildirim geldiğinde **800 Hz bip sesi** çalmalı
   - Ses 0.2 saniye sürmeli
   - Sadece yeni bildirim geldiğinde çalmalı (ilk yüklemede çalmaz)

3. **Bildirim Dropdown:**
   - Bell ikonuna tıklayın
   - "Yeni İlan Onay Bekliyor" başlıklı bildirim görünmeli
   - Mesaj: "X kullanıcısı 'TEST - Yeni İlan Uyarısı' başlıklı yeni bir ilan oluşturdu..."

4. **Admin Panel:**
   - `/admin/ilanlar?status=pending` sayfasına gidin
   - Yeni oluşturulan test ilanı görünmeli
   - "Bekleyen" durumunda olmalı

### 5. Email Bildirimi (Opsiyonel)
- Email bildirimi şu anda simüle ediliyor
- Console log'ları kontrol edin (PM2 logs)
- Gerçek email göndermek için email servisi kurulmalı

## 🔍 Kontrol Noktaları

### ✅ Başarılı Test İçin:
- [ ] Yeni ilan oluşturulduğunda bildirim oluşturuldu
- [ ] Header'da bildirim sayacı arttı
- [ ] Sesli uyarı çaldı (yeni bildirim geldiğinde)
- [ ] Bildirim dropdown'da görünüyor
- [ ] Admin panelinde ilan görünüyor
- [ ] Email bildirimi simüle edildi (console.log)

### ❌ Sorun Varsa:
1. **Bildirim gelmiyor:**
   - PM2 loglarını kontrol edin: `ssh root@alo17.tr "pm2 logs alo17 --lines 50"`
   - Database'de notification kaydı var mı kontrol edin
   - Admin email doğru mu kontrol edin

2. **Sesli uyarı çalmıyor:**
   - Tarayıcı konsolunu açın (F12)
   - Hata mesajı var mı kontrol edin
   - Tarayıcı ses izni var mı kontrol edin
   - Web Audio API destekleniyor mu kontrol edin

3. **Bildirim sayacı güncellenmiyor:**
   - Sayfayı yenileyin
   - 30 saniye bekleyin (otomatik yenileme)
   - API endpoint'i çalışıyor mu kontrol edin: `/api/notifications`

## 🧪 Hızlı Test Komutları

### PM2 Loglarını Kontrol Et
```powershell
ssh root@alo17.tr "pm2 logs alo17 --lines 50 --nostream"
```

### Database'de Notification Kontrolü
```powershell
ssh root@alo17.tr "cd /var/www/alo17 && npx prisma studio"
# Veya SQL ile:
ssh root@alo17.tr "cd /var/www/alo17 && npx prisma db execute --stdin" <<< "SELECT * FROM Notification ORDER BY createdAt DESC LIMIT 5;"
```

### API Endpoint Testi
```powershell
# Bildirimleri getir
Invoke-WebRequest -Uri "https://alo17.tr/api/notifications" -Method GET -UseBasicParsing
```

## 📊 Beklenen Sonuçlar

1. **İlan Oluşturulduğunda:**
   - Console'da: "Email bildirimi gönderildi (simüle)"
   - Database'de: Yeni notification kaydı
   - Header'da: Bildirim sayacı +1

2. **30 Saniye Sonra (Otomatik Yenileme):**
   - Yeni bildirim algılanır
   - Sesli uyarı çalar (eğer yeni bildirim varsa)
   - Bildirim sayacı güncellenir

3. **Admin Bildirime Tıkladığında:**
   - Bildirim okundu işaretlenir
   - Sayac azalır
   - İlan detay sayfasına yönlendirilir

## 🎵 Sesli Uyarı Testi

Sesli uyarıyı manuel test etmek için:

1. Tarayıcı konsolunu açın (F12)
2. Console'a şunu yazın:
```javascript
// Test sesi
const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);
oscillator.frequency.value = 800;
oscillator.type = 'sine';
gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
oscillator.start(audioContext.currentTime);
oscillator.stop(audioContext.currentTime + 0.2);
```

Eğer ses çalıyorsa, sistem çalışıyor demektir.

## 🔧 Sorun Giderme

### Bildirim Gelmiyor
1. `src/lib/admin.ts` dosyasında `getAdminEmail()` doğru mu?
2. Database'de admin kullanıcısı var mı?
3. Notification tablosu var mı? (`npx prisma db push`)

### Sesli Uyarı Çalmıyor
1. Tarayıcı ses izni var mı?
2. Web Audio API destekleniyor mu? (Chrome, Firefox, Edge)
3. Console'da hata var mı?

### Email Gönderilmiyor
- Email servisi şu anda simüle ediliyor
- Gerçek email için `src/lib/email.ts` dosyasını güncelleyin

## ✅ Test Tamamlandı

Test başarılıysa:
- [x] Bildirim sistemi çalışıyor
- [x] Sesli uyarı çalışıyor
- [x] Header dropdown çalışıyor
- [x] Admin panelinde ilan görünüyor

Test ilanını silmeyi unutmayın! 🗑️

