# Google OAuth Giriş Kurulum Rehberi

## 1. Google Cloud Console'da Proje Oluşturma

### Adım 1: Google Cloud Console'a Giriş
1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Google hesabınızla giriş yapın

### Adım 2: Yeni Proje Oluştur
1. Üst menüden **"Proje Seç"** veya **"New Project"** tıklayın
2. Proje adı girin (örn: "Alo17 OAuth")
3. **"Oluştur"** butonuna tıklayın

## 2. OAuth Consent Screen (Onay Ekranı) Yapılandırma

### Adım 1: OAuth Consent Screen'e Git
1. Sol menüden **"APIs & Services"** > **"OAuth consent screen"** seçin
2. User Type seçin:
   - **External** (Genel kullanım için)
   - **Internal** (Sadece Google Workspace kullanıcıları için)

### Adım 2: Uygulama Bilgilerini Doldur
- **App name**: Alo17 (veya istediğiniz isim)
- **User support email**: Destek e-posta adresiniz
- **Developer contact information**: Geliştirici e-posta adresiniz
- **App logo**: (Opsiyonel) Logo yükleyin
- **App domain**: `alo17.tr` (veya domain'iniz)
- **Authorized domains**: `alo17.tr` (veya domain'iniz)

### Adım 3: Scopes (İzinler)
- **Email** (varsayılan)
- **Profile** (varsayılan)
- **OpenID** (varsayılan)

### Adım 4: Test Users (Test Aşamasında)
- Test aşamasındaysanız, test kullanıcılarının e-posta adreslerini ekleyin

### Adım 5: Kaydet ve Devam Et
- **"Save and Continue"** ile ilerleyin
- **"Back to Dashboard"** ile bitirin

## 3. OAuth 2.0 Client ID Oluşturma

### Adım 1: Credentials Sayfasına Git
1. Sol menüden **"APIs & Services"** > **"Credentials"** seçin
2. Üstte **"+ CREATE CREDENTIALS"** tıklayın
3. **"OAuth client ID"** seçin

### Adım 2: OAuth Client ID Ayarları
- **Application type**: **Web application** seçin
- **Name**: "Alo17 Web Client" (veya istediğiniz isim)

### Adım 3: Authorized JavaScript origins
```
http://localhost:3000
https://alo17.tr
https://www.alo17.tr
```
(Production domain'inizi ekleyin)

### Adım 4: Authorized redirect URIs
```
http://localhost:3000/api/auth/callback/google
https://alo17.tr/api/auth/callback/google
https://www.alo17.tr/api/auth/callback/google
```
(Production domain'inizi ekleyin)

### Adım 5: Oluştur
- **"CREATE"** butonuna tıklayın
- **Client ID** ve **Client Secret** değerlerini kopyalayın (sadece bir kez gösterilir!)

## 4. Environment Variables Ekleme

### Local Development (.env.local)
Proje kök dizininde `.env.local` dosyası oluşturun veya düzenleyin:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here
```

### Production Environment Variables
Hosting sağlayıcınızda (Netlify, Vercel, vb.) environment variables ekleyin:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
NEXTAUTH_URL=https://alo17.tr
NEXTAUTH_SECRET=your-random-secret-key-here
```

### NEXTAUTH_SECRET Oluşturma
Güçlü bir secret key oluşturmak için:
```bash
openssl rand -base64 32
```
veya online araçlar kullanabilirsiniz.

## 5. Kod Kontrolü

Kod zaten hazır! `src/lib/auth.ts` dosyasında GoogleProvider yapılandırılmış:

```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
}),
```

## 6. Test Etme

1. Sunucuyu yeniden başlatın:
   ```bash
   npm run dev
   ```

2. Tarayıcıda `http://localhost:3000/giris` adresine gidin

3. **"Google ile Giriş Yap"** butonuna tıklayın

4. Google hesabınızla giriş yapın

5. İlk girişte OAuth consent screen görünecek (test aşamasında)

## 7. Production'a Geçiş

### OAuth Consent Screen'i Publish Et
1. Google Cloud Console > OAuth consent screen
2. **"PUBLISH APP"** butonuna tıklayın
3. Google'ın inceleme süreci başlar (genellikle birkaç gün)

### Domain Doğrulama
1. Google Search Console'da domain'inizi doğrulayın
2. OAuth consent screen'de domain'inizi ekleyin

## Önemli Notlar

⚠️ **Güvenlik:**
- `.env.local` dosyasını asla Git'e commit etmeyin
- Client Secret'ı asla paylaşmayın
- Production'da güçlü bir NEXTAUTH_SECRET kullanın

⚠️ **Redirect URIs:**
- Her domain için ayrı redirect URI ekleyin
- HTTP ve HTTPS için ayrı ekleyin (localhost için HTTP, production için HTTPS)

⚠️ **Rate Limits:**
- Test aşamasında günlük 100 kullanıcı limiti var
- Production'a geçince bu limit kalkar

## Sorun Giderme

### "redirect_uri_mismatch" Hatası
- Google Cloud Console'da redirect URI'ları kontrol edin
- Tam olarak eşleşmeli (http/https, trailing slash, vb.)

### "access_denied" Hatası
- OAuth consent screen'de test kullanıcıları ekleyin
- Veya uygulamayı publish edin

### Environment Variables Çalışmıyor
- `.env.local` dosyasının proje kök dizininde olduğundan emin olun
- Sunucuyu yeniden başlatın
- Değişken isimlerinin doğru olduğunu kontrol edin

## Yardımcı Linkler

- [Google Cloud Console](https://console.cloud.google.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

