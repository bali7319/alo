# Google OAuth Client ID Oluşturma - Adım Adım

## Hızlı Bağlantı
[Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=jovial-circuit-460514-j9)

## Adım 1: OAuth Consent Screen (İlk Kez Yapıyorsanız)

1. [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent?project=jovial-circuit-460514-j9) sayfasına gidin
2. **User Type**: **External** seçin → **CREATE** tıklayın
3. **App information** bölümünü doldurun:
   - **App name**: `Alo17`
   - **User support email**: E-posta adresiniz
   - **Developer contact information**: E-posta adresiniz
4. **Save and Continue** tıklayın
5. **Scopes** bölümünde varsayılanları bırakın → **Save and Continue**
6. **Test users** bölümünde (opsiyonel) test e-postaları ekleyin → **Save and Continue**
7. **Summary** → **Back to Dashboard**

## Adım 2: OAuth Client ID Oluştur

1. [Credentials](https://console.cloud.google.com/apis/credentials?project=jovial-circuit-460514-j9) sayfasına gidin
2. Üstte **"+ CREATE CREDENTIALS"** butonuna tıklayın
3. **"OAuth client ID"** seçin

### Formu Doldurun:

**Application type**: 
- ✅ **Web application** seçin

**Name**: 
- `Alo17 Web Client` (veya istediğiniz isim)

**Authorized JavaScript origins**:
```
http://localhost:3000
```

**Authorized redirect URIs**:
```
http://localhost:3000/api/auth/callback/google
```

### Production için (daha sonra ekleyin):
```
https://alo17.tr
https://www.alo17.tr
```
ve
```
https://alo17.tr/api/auth/callback/google
https://www.alo17.tr/api/auth/callback/google
```

4. **CREATE** butonuna tıklayın

5. **Client ID** ve **Client Secret** değerlerini kopyalayın (sadece bir kez gösterilir!)

## Adım 3: .env.local Dosyasını Doldurun

1. Proje kök dizinindeki `.env.local` dosyasını açın
2. `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` değerlerini yapıştırın
3. `NEXTAUTH_SECRET` için güçlü bir rastgele string oluşturun:
   - Online: https://generate-secret.vercel.app/32
   - Veya: `openssl rand -base64 32` komutu

## Adım 4: Sunucuyu Yeniden Başlatın

```bash
npm run dev
```

## Adım 5: Test Edin

1. http://localhost:3000/giris adresine gidin
2. "Google ile Giriş Yap" butonuna tıklayın
3. Google hesabınızla giriş yapın

---

## Önemli Notlar

⚠️ **Client Secret'ı asla paylaşmayın!**
⚠️ **.env.local dosyasını Git'e commit etmeyin!**
⚠️ Production'da domain'inizi eklemeyi unutmayın!

