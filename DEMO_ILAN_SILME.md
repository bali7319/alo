# Demo/Örnek İlanları Silme

## 🚀 Hızlı Silme (Sunucuda)

### Yöntem 1: Script ile (Önerilen)

```bash
# Sunucuya bağlan
ssh root@alo17.tr

# Proje dizinine git
cd /var/www/alo17

# Script'i çalıştır
node scripts/check-and-delete-demo-listings.js
```

### Yöntem 2: API Route ile

**Tarayıcıdan (Admin olarak giriş yapmış olmalısınız):**
```
http://alo17.tr/api/admin/check-demo-listings
```

**Silme için:**
```javascript
// Tarayıcı konsolunda
fetch('/api/admin/check-demo-listings', { method: 'DELETE' })
  .then(r => r.json())
  .then(console.log)
```

### Yöntem 3: Admin Panelinden

1. Admin paneline giriş yap: `http://alo17.tr/admin`
2. "Demo/Örnek İlanları Kontrol Et" butonuna tıkla
3. Bulunan ilanları görüntüle
4. "Demo İlanları Sil" butonuna tıkla

## 📋 Silinecek İlanlar

- Admin kullanıcısına ait tüm ilanlar (`admin@alo17.tr`)
- Başlıkta "Demo", "Örnek", "Test" içeren ilanlar
- Marka veya model'de "Demo", "Örnek" içeren ilanlar

## ⚠️ Dikkat

- Silme işlemi geri alınamaz!
- İlişkili kayıtlar otomatik temizlenir:
  - Favoriler
  - Mesajlar (listingId null yapılır)
  - Şikayetler

