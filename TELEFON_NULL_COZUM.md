# Telefon Numarası Null Sorunu - Çözüm

## Durum
API response'unda `Telefon: null` görünüyor. Bu, telefon numarasının:
1. Kullanıcı profilinde olmadığı
2. Veya eski key ile şifrelenmiş olduğu (çözülemiyor)

anlamına gelir.

## Çözüm Adımları

### 1. İlan Sahibini Bulun
- İlan sayfasında "Satıcı Bilgileri" bölümüne bakın
- VEYA admin panelinde (`https://alo17.tr/admin/ilanlar`) ilanı bulun ve sahibini görün

### 2. Admin Panelinde Telefon Numarasını Kontrol Edin
1. `https://alo17.tr/admin/uyeler` sayfasını açın
2. İlan sahibinin email'ini veya adını arayın
3. Telefon sütununa bakın:
   - Eğer "-" görünüyorsa → Telefon numarası yok
   - Eğer bir şey görünüyorsa → Telefon numarası var ama çözülemiyor olabilir

### 3. Telefon Numarasını Güncelleyin
1. Telefon sütunundaki **düzenleme butonuna** (kalem ikonu) tıklayın
2. Telefon numarasını girin (örnek: `0544513204`)
3. **Kaydet** butonuna (✓) tıklayın
4. Telefon numarası yeni key ile şifrelenecek

### 4. İlan Sayfasını Test Edin
1. İlan sayfasını yenileyin (F5)
2. Console'da tekrar kontrol edin:
   ```javascript
   fetch('/api/listings/cmjwxtjxl0009bf49ebvxul1x').then(r => r.json()).then(d => console.log('Telefon:', d.listing.user.phone))
   ```
3. Artık telefon numarası görünmeli
4. İlan sayfasında telefon butonu görünmeli

## Notlar
- Telefon numarası güncellendiğinde yeni key ile şifrelenecek
- Eski key ile şifrelenmiş telefon numaraları çözülemez, bu yüzden yeniden girilmelidir
- Admin panelinden güncellenen telefon numaraları tüm ilanlarda görünecektir

