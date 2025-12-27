# 🚨 Site Hala Yavaş - Acil Çözüm

## 🔴 KRİTİK SORUNLAR (Önce Bunları Kontrol Et!)

### 1. Database Index'leri Eklendi mi? ⚠️ EN ÖNEMLİSİ!

**Index'ler olmadan site %70-80 daha yavaş çalışır!**

Sunucuda kontrol et:
```bash
ssh root@alo17.tr
sudo -u postgres psql -d alo17_db -c "\d+ Listing" | grep -i index
```

**Eğer index yoksa, HEMEN ekle:**
```bash
sudo -u postgres psql -d alo17_db << 'EOF'
CREATE INDEX IF NOT EXISTS idx_listing_category ON "Listing"(category);
CREATE INDEX IF NOT EXISTS idx_listing_subcategory ON "Listing"("subCategory");
CREATE INDEX IF NOT EXISTS idx_listing_active ON "Listing"("isActive", "approvalStatus");
CREATE INDEX IF NOT EXISTS idx_listing_premium ON "Listing"("isPremium", "isActive");
CREATE INDEX IF NOT EXISTS idx_listing_created ON "Listing"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_listing_user ON "Listing"("userId");
CREATE INDEX IF NOT EXISTS idx_listing_expires ON "Listing"("expiresAt");
CREATE INDEX IF NOT EXISTS idx_listing_category_active ON "Listing"(category, "isActive", "approvalStatus");
CREATE INDEX IF NOT EXISTS idx_listing_premium_active ON "Listing"("isPremium", "isActive", "approvalStatus", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_listing_category_subcategory ON "Listing"(category, "subCategory", "isActive", "approvalStatus");
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
\q
EOF
```

---

### 2. Değişiklikler Deploy Edildi mi?

**Kontrol et:**
```bash
# Sunucuda
cd /var/www/alo17
git log --oneline -5  # Son commit'leri kontrol et
# veya
cat src/app/page.tsx | grep "images: true"  # Eğer çıktı varsa, eski kod hala var!
```

**Deploy et:**
```powershell
cd C:\Users\bali\Desktop\alo
scp src/app/page.tsx root@alo17.tr:/var/www/alo17/src/app/page.tsx
scp src/app/api/listings/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/route.ts
```

```bash
ssh root@alo17.tr
cd /var/www/alo17
rm -rf .next
npm run build
pm2 restart alo17
```

---

### 3. Sunucu Kaynakları Yeterli mi?

**Kontrol et:**
```bash
# CPU ve Memory kullanımı
top
# veya
htop

# Disk kullanımı
df -h

# PM2 durumu
pm2 status
pm2 logs alo17 --lines 50
```

**Sorun varsa:**
- CPU %100 ise → Daha güçlü sunucu gerekli
- Memory %100 ise → Swap ekle veya memory artır
- Disk %100 ise → Temizlik yap

---

### 4. Database Bağlantı Sorunları

**Kontrol et:**
```bash
# PostgreSQL durumu
sudo systemctl status postgresql

# Connection sayısı
sudo -u postgres psql -d alo17_db -c "SELECT count(*) FROM pg_stat_activity;"

# Yavaş sorgular
sudo -u postgres psql -d alo17_db -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds';"
```

---

### 5. Nginx Cache ve Timeout Ayarları

**Kontrol et:**
```bash
cat /etc/nginx/sites-available/alo17.tr | grep -i "timeout\|cache"
```

**Sorun varsa, Nginx config'i güncelle:**
```nginx
proxy_read_timeout 60s;
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
```

---

## ✅ Hızlı Test

### 1. Anasayfa Yükleme Süresi
```bash
curl -w "@-" -o /dev/null -s "http://alo17.tr" <<'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
```

**İyi:** < 1 saniye
**Kötü:** > 3 saniye

### 2. Database Sorgu Süresi
```bash
sudo -u postgres psql -d alo17_db << 'EOF'
\timing on
SELECT COUNT(*) FROM "Listing" WHERE "isActive" = true AND "approvalStatus" = 'approved';
EOF
```

**İyi:** < 100ms
**Kötü:** > 1000ms (index gerekli!)

---

## 🎯 Öncelik Sırası

1. ✅ **Database Index'leri** (KRİTİK - %70 hızlanma)
2. ✅ **Deploy Değişiklikler** (Anasayfa optimizasyonu)
3. ⚠️ **Sunucu Kaynakları** (CPU/Memory kontrol)
4. ⚠️ **Nginx Timeout** (Gerekirse artır)
5. ⚠️ **Database Connection Pool** (Prisma zaten yapıyor)

---

## 📊 Beklenen İyileştirmeler

| Adım | İyileştirme |
|------|------------|
| Database Index'leri | **%50-70** |
| Anasayfa Optimizasyonu | **%80-90** |
| Cache Stratejisi | **%30-40** |
| **TOPLAM** | **%85-95 daha hızlı** |

---

## 🆘 Hala Yavaşsa

1. **Browser DevTools** aç (F12)
2. **Network** tab'ına git
3. Hangi request yavaş, kontrol et
4. **Console** tab'ında hata var mı, kontrol et
5. **Performance** tab'ında bottleneck'leri gör

