# Natro VPS - İlk Adımlar ve Kullanıcı Oluşturma

## 🔐 İlk Giriş

### 1. Console ile Giriş (Natro Panel)
Natro panelinden VPS'inize bağlanın:
- VPS yönetim panelinde "Console" veya "VNC Console" butonuna tıklayın
- Şifrenizi girerek giriş yapın

### 2. SSH ile Giriş (Önerilen)
Terminal/Command Prompt'tan:
```bash
ssh root@your-server-ip
# veya
ssh root@your-domain.com
```

İlk girişte şifre soracak, Natro'dan aldığınız şifreyi girin.

## 👤 Kullanıcı Oluşturma (Önerilen)

Root kullanıcısı ile çalışmak güvenlik riski oluşturabilir. Bir kullanıcı oluşturmanız önerilir:

### Adım 1: Yeni Kullanıcı Oluştur
```bash
# Yeni kullanıcı oluştur (örnek: alo17)
adduser alo17
```

Şifre belirleyin ve bilgileri doldurun (isteğe bağlı).

### Adım 2: Sudo Yetkisi Ver
```bash
# Kullanıcıya sudo yetkisi ver
usermod -aG sudo alo17
```

### Adım 3: SSH Key Ekleme (Opsiyonel - Güvenlik için)
```bash
# Kullanıcıya geç
su - alo17

# .ssh klasörü oluştur
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Public key ekle (kendi bilgisayarınızdan)
nano ~/.ssh/authorized_keys
# Buraya kendi bilgisayarınızdan oluşturduğunuz public key'i yapıştırın

chmod 600 ~/.ssh/authorized_keys
```

### Adım 4: Yeni Kullanıcı ile Giriş
```bash
# Çıkış yap
exit

# Yeni kullanıcı ile giriş
ssh alo17@your-server-ip
```

## 🔧 Root ile Devam Etmek İsterseniz

Eğer root kullanıcısı ile devam etmek istiyorsanız (hızlı başlangıç için):

```bash
# Root olarak giriş yap
ssh root@your-server-ip

# Şifrenizi girin
```

**Not**: Root ile çalışırken dikkatli olun, yanlış komutlar sistemi bozabilir.

## ✅ İlk Kontroller

Giriş yaptıktan sonra şunları kontrol edin:

```bash
# Sistem bilgisi
uname -a

# Disk kullanımı
df -h

# RAM kullanımı
free -h

# IP adresi
ip addr show
# veya
hostname -I
```

## 🚀 Sonraki Adımlar

Kullanıcı oluşturduktan sonra (veya root ile devam ederseniz):

1. **Sistem güncellemesi yapın**
2. **Node.js kurun**
3. **PostgreSQL kurun**
4. **Projeyi deploy edin**

Detaylı adımlar için `NATRO_QUICK_START.md` dosyasına bakın.

## 🔒 Güvenlik Notları

### Root ile çalışıyorsanız:
- ✅ Şifreyi güçlü tutun
- ✅ Fail2ban kurun (brute force koruması)
- ✅ Firewall (UFW) aktif edin
- ⚠️ Dikkatli komut çalıştırın

### Normal kullanıcı ile çalışıyorsanız:
- ✅ Sudo yetkisi ile güvenli çalışma
- ✅ Root şifresini değiştirin
- ✅ SSH key authentication kullanın (şifre yerine)

## 🆘 Sorun Giderme

### SSH bağlantı hatası:
```bash
# Firewall kontrolü
ufw status

# SSH servisi kontrolü
systemctl status ssh
# veya
systemctl status sshd
```

### Şifre unuttum:
- Natro panelinden şifre sıfırlama yapın
- Veya console üzerinden root şifresini değiştirin

### Kullanıcı oluşturamıyorum:
```bash
# Root yetkisi kontrolü
whoami  # root yazmalı

# Kullanıcı listesi
cat /etc/passwd
```

