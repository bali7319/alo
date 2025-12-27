# 🗑️ Demo/Örnek İlanları Silme - Acil

## 🚀 Hızlı Çözüm: Script ile Sil

### 1. Script'i Sunucuya Aktar

```powershell
cd C:\Users\bali\Desktop\alo
scp scripts/check-and-delete-demo-listings.js root@alo17.tr:/var/www/alo17/scripts/check-and-delete-demo-listings.js
```

### 2. Sunucuda Çalıştır

```bash
ssh root@alo17.tr
cd /var/www/alo17
node scripts/check-and-delete-demo-listings.js
```

---

## 🔄 Alternatif: Admin Panelinden Sil

1. Admin paneline giriş yap: `http://alo17.tr/admin`
2. "Demo/Örnek İlanları Kontrol Et" butonuna tıkla
3. Bulunan ilanları görüntüle
4. "Demo İlanları Sil" butonuna tıkla

---

## 📋 Silinecek İlanlar

- ✅ Başlıkta "Örnek İlan" içeren tüm ilanlar
- ✅ Başlıkta "Demo" içeren tüm ilanlar
- ✅ Başlıkta "Test" içeren tüm ilanlar
- ✅ Admin kullanıcısına ait tüm ilanlar (`admin@alo17.tr`)
- ✅ Marka/model'de "Demo" veya "Örnek" içeren ilanlar

**Tahmini:** ~1400+ demo ilan silinecek

---

## ⚠️ Dikkat

- Silme işlemi geri alınamaz!
- İlişkili kayıtlar otomatik temizlenir:
  - Favoriler
  - Mesajlar (listingId null yapılır)
  - Şikayetler

---

## ✅ Silme Sonrası

1. Anasayfayı kontrol et: `http://alo17.tr`
2. Tüm ilanlar sayfasını kontrol et: `http://alo17.tr/ilanlar`
3. Kategori sayfalarını kontrol et

