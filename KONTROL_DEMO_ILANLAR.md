# Demo/Örnek İlan Kontrol ve Silme

## 🔍 Kontrol Etme

### Yöntem 1: API Route (Önerilen)

**Kontrol için:**
```bash
# Sunucuda
curl http://localhost:3000/api/admin/check-demo-listings

# Veya tarayıcıda (admin olarak giriş yapmış olmalısınız)
http://alo17.tr/api/admin/check-demo-listings
```

**Silme için:**
```bash
# Sunucuda
curl -X DELETE http://localhost:3000/api/admin/check-demo-listings

# Veya JavaScript ile
fetch('/api/admin/check-demo-listings', { method: 'DELETE' })
  .then(r => r.json())
  .then(console.log)
```

### Yöntem 2: SQL Sorgusu

```sql
-- Demo/örnek ilanları kontrol et
SELECT id, title, category, "approvalStatus", "isActive", "createdAt"
FROM "Listing" 
WHERE 
  title ILIKE '%örnek%' OR 
  title ILIKE '%demo%' OR 
  title ILIKE '%test%' OR
  title ILIKE '%Örnek%' OR
  title ILIKE '%Demo%' OR
  title ILIKE '%Test%'
ORDER BY "createdAt" DESC;

-- Admin kullanıcısına ait ilanlar
SELECT l.id, l.title, l.category, l."approvalStatus", l."isActive"
FROM "Listing" l
JOIN "User" u ON l."userId" = u.id
WHERE u.email = 'admin@alo17.tr';
```

### Yöntem 3: Script

```bash
# Sunucuda
cd /var/www/alo17
node scripts/check-demo-listings.js
```

## 🗑️ Silme

### API Route ile Silme (Önerilen)

```bash
# Sunucuda
curl -X DELETE http://localhost:3000/api/admin/check-demo-listings
```

### SQL ile Silme

```sql
-- Önce kontrol et
SELECT COUNT(*) FROM "Listing" 
WHERE 
  title ILIKE '%örnek%' OR 
  title ILIKE '%demo%' OR 
  title ILIKE '%test%';

-- Sonra sil
DELETE FROM "Listing" 
WHERE 
  title ILIKE '%örnek%' OR 
  title ILIKE '%demo%' OR 
  title ILIKE '%test%' OR
  title ILIKE '%Örnek%' OR
  title ILIKE '%Demo%' OR
  title ILIKE '%Test%';
```

## 📋 Kontrol Edilen Kriterler

1. **Admin kullanıcısına ait tüm ilanlar** (`admin@alo17.tr`)
2. **Başlıkta "Demo", "Örnek", "Test" içeren ilanlar**
3. **Marka veya model'de "Demo", "Örnek" içeren ilanlar**

## ⚠️ Dikkat

- Silme işlemi geri alınamaz!
- İlişkili kayıtlar otomatik temizlenir (favoriler, mesajlar)
- Sadece admin kullanıcıları bu işlemi yapabilir

