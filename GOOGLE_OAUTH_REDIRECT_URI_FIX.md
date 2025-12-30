# Google OAuth Redirect URI Mismatch Hatası - Çözüm

## 🔍 Sorun
`redirect_uri_mismatch` hatası alıyorsunuz. Bu, Google Cloud Console'da yapılandırılan redirect URI'nin, NextAuth'ın kullandığı URI ile eşleşmediği anlamına gelir.

## ✅ Çözüm

### 1. Google Cloud Console'a Gidin
[Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=jovial-circuit-460514-j9)

### 2. OAuth 2.0 Client ID'nizi Açın
Client ID: `994791867914-6qsiuaag21nqvoms853n9rlkkhub0jap.apps.googleusercontent.com`

### 3. Authorized redirect URIs Bölümüne Ekleyin

**MUTLAKA EKLENMESİ GEREKENLER:**
```
https://alo17.tr/api/auth/callback/google
https://www.alo17.tr/api/auth/callback/google
```

**Opsiyonel (Localhost için test):**
```
http://localhost:3000/api/auth/callback/google
```

### 4. Authorized JavaScript origins Bölümüne Ekleyin

**MUTLAKA EKLENMESİ GEREKENLER:**
```
https://alo17.tr
https://www.alo17.tr
```

**Opsiyonel (Localhost için test):**
```
http://localhost:3000
```

### 5. Kaydedin
- **SAVE** butonuna tıklayın
- Değişikliklerin etkin olması 1-2 dakika sürebilir

## 🔄 Sunucu Kontrolü

Sunucudaki environment variables doğru görünüyor:
- ✅ `NEXTAUTH_URL="https://alo17.tr"` - Doğru

Google OAuth bilgilerini kontrol edin:
```bash
ssh root@alo17.tr "cd /var/www/alo17 && grep GOOGLE_CLIENT .env"
```

## ⚠️ Önemli Notlar

1. **Redirect URI formatı çok önemli:**
   - ✅ Doğru: `https://alo17.tr/api/auth/callback/google`
   - ❌ Yanlış: `https://alo17.tr/api/auth/callback/google/` (sonunda slash olmamalı)
   - ❌ Yanlış: `https://alo17.tr/auth/callback/google` (eksik `/api`)

2. **HTTP vs HTTPS:**
   - Production için mutlaka `https://` kullanın
   - `http://` sadece localhost için kullanılır

3. **www ve non-www:**
   - Her ikisini de ekleyin (hem `alo17.tr` hem `www.alo17.tr`)

## 🧪 Test

1. Google Cloud Console'da redirect URI'leri ekleyin
2. 1-2 dakika bekleyin
3. Tarayıcıda `https://alo17.tr/giris` sayfasına gidin
4. "Google ile Giriş Yap" butonuna tıklayın
5. Google hesabınızla giriş yapın

## 📝 Hala Çalışmıyorsa

1. **PM2'yi yeniden başlatın:**
   ```bash
   ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart all"
   ```

2. **Browser cache'i temizleyin:**
   - Ctrl+Shift+Delete ile cache'i temizleyin
   - Veya gizli modda (incognito) deneyin

3. **Google Cloud Console'da kontrol edin:**
   - Redirect URI'lerin tam olarak eşleştiğinden emin olun
   - Boşluk veya fazladan karakter olmamalı

