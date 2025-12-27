# SSH Şifre Değiştirme Rehberi

## 🔐 Root Kullanıcısı Şifresini Değiştirme

### Yöntem 1: Natro Console'dan (ÖNERİLEN)

1. **Natro Console'a giriş yapın**
2. **Şu komutu çalıştırın:**
   ```bash
   passwd
   ```
3. **Mevcut şifrenizi girin** (eğer sorulursa)
4. **Yeni şifrenizi girin** (görünmez, normal)
5. **Yeni şifrenizi tekrar girin** (onay için)
6. **Enter** tuşuna basın

### Yöntem 2: SSH ile Bağlanmışken

Eğer SSH ile bağlanabiliyorsanız:

```bash
# Root kullanıcısı şifresini değiştir
passwd

# Veya başka bir kullanıcı için
passwd kullanici_adi
```

## 👤 Diğer Kullanıcı Şifresini Değiştirme

### Root Olarak Başka Kullanıcının Şifresini Değiştirme

```bash
# Kullanıcı şifresini değiştir (root yetkisi gerekir)
sudo passwd kullanici_adi

# Örnek:
sudo passwd alo17
```

### Kullanıcı Kendi Şifresini Değiştirme

```bash
# Kullanıcı olarak giriş yapın
ssh kullanici_adi@alo17.tr

# Şifrenizi değiştirin
passwd
```

## 🔧 Adım Adım: Natro Console'dan

### 1. Console'a Giriş Yapın

1. Natro kontrol paneline gidin
2. VPS yönetim bölümüne gidin
3. **"Console"** veya **"Web Console"** butonuna tıklayın
4. Giriş yapın (root veya kullanıcı adınızla)

### 2. Şifre Değiştirme Komutunu Çalıştırın

```bash
passwd
```

### 3. Şifre Girişi

```
New password: [yeni şifrenizi yazın - görünmez]
Retype new password: [yeni şifrenizi tekrar yazın]
```

**Not:** Şifre yazarken görünmez, bu normaldir. Sadece yazın ve Enter'a basın.

### 4. Başarı Mesajı

```
passwd: password updated successfully
```

## ⚠️ Güvenlik İpuçları

### Güçlü Şifre Seçimi

Şifreniz şunları içermelidir:
- ✅ En az 12 karakter
- ✅ Büyük ve küçük harf
- ✅ Rakamlar
- ✅ Özel karakterler (!@#$%^&*)

### Şifre Örnekleri (GÜVENLİ DEĞİL - Sadece format örneği)

```
❌ Kötü: password123
❌ Kötü: 12345678
✅ İyi: MyP@ssw0rd!2024
✅ İyi: Alo17#Secure$Pass
```

## 🔄 SSH Bağlantısını Test Etme

Şifre değiştirdikten sonra:

1. **Mevcut SSH bağlantısını kapatın:**
   ```bash
   exit
   ```

2. **Yeni şifre ile bağlanmayı deneyin:**
   ```powershell
   ssh root@alo17.tr
   ```

3. **Yeni şifrenizi girin**

## 🆘 Sorun Giderme

### "Permission denied" Hatası

Eğer `passwd` komutu çalışmıyorsa:

```bash
# Sudo ile deneyin
sudo passwd

# Veya root kullanıcısı olarak giriş yapın
su -
passwd
```

### Şifre Çok Kısa Hatası

```bash
# Minimum şifre uzunluğu kontrolü
# Şifreniz en az 8 karakter olmalı (genellikle)
# Daha uzun ve karmaşık bir şifre seçin
```

### Şifre Değiştirilemiyor

1. **Root yetkisi kontrolü:**
   ```bash
   whoami
   # "root" görünmeli
   ```

2. **PAM ayarlarını kontrol edin:**
   ```bash
   cat /etc/pam.d/common-password
   ```

3. **Şifre politikası kontrolü:**
   ```bash
   chage -l root
   ```

## 📝 Hızlı Komutlar

### Root Şifresini Değiştir
```bash
passwd
```

### Başka Kullanıcı Şifresini Değiştir
```bash
sudo passwd kullanici_adi
```

### Şifre Politikası Görüntüle
```bash
chage -l root
```

### Şifre Süresi Ayarla
```bash
# Şifrenin 90 günde bir değiştirilmesini zorunlu kıl
chage -M 90 root
```

## ✅ Kontrol Listesi

- [ ] Natro Console'a giriş yapıldı
- [ ] `passwd` komutu çalıştırıldı
- [ ] Yeni şifre girildi (2 kez)
- [ ] Başarı mesajı alındı
- [ ] Yeni şifre ile SSH bağlantısı test edildi

## 🔒 Ek Güvenlik: SSH Key Kullanımı

Şifre yerine SSH key kullanmak daha güvenlidir:

### SSH Key Oluşturma (Windows PowerShell)

```powershell
# SSH key oluştur
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Public key'i görüntüle
cat ~/.ssh/id_rsa.pub
```

### Sunucuya Key Ekleme

```bash
# Sunucuda .ssh klasörü oluştur
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Public key'i ekle
nano ~/.ssh/authorized_keys
# (Public key içeriğini yapıştırın)

# İzinleri düzelt
chmod 600 ~/.ssh/authorized_keys
```

## 💡 İpuçları

1. **Şifre değiştirdikten sonra** mevcut SSH bağlantıları kapanabilir
2. **Yeni şifre ile tekrar bağlanın**
3. **Şifreyi güvenli bir yerde saklayın** (password manager kullanın)
4. **Düzenli olarak şifre değiştirin** (3-6 ayda bir)

