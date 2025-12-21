# SSH Bağlantı Sorunu Çözümü

## 🔴 Hata: REMOTE HOST IDENTIFICATION HAS CHANGED

Bu hata, sunucunun host key'inin değiştiğini gösterir. Genellikle:
- ✅ Sunucu yeniden kuruldu
- ✅ IP adresi başka bir sunucuya atandı
- ✅ Sunucu yapılandırması değişti

## 🔧 Çözüm: Windows PowerShell

### Yöntem 1: Eski Kaydı Sil (Önerilen)

PowerShell'de çalıştırın:

```powershell
# Eski kaydı sil
ssh-keygen -R alo17.tr

# Veya IP adresi ile
ssh-keygen -R your-server-ip
```

### Yöntem 2: Manuel Silme

```powershell
# known_hosts dosyasını düzenle
notepad C:\Users\bali\.ssh\known_hosts

# 4. satırı sil (hatada belirtilen satır)
# Dosyayı kaydet ve kapat
```

### Yöntem 3: Tüm Kayıtları Temizle (Dikkatli!)

```powershell
# Tüm known_hosts dosyasını sil (tüm sunucular için tekrar onay isteyecek)
Remove-Item C:\Users\bali\.ssh\known_hosts
```

## ✅ Tekrar Bağlan

Kaydı sildikten sonra:

```powershell
ssh root@alo17.tr
```

İlk bağlantıda şu mesajı göreceksiniz:
```
The authenticity of host 'alo17.tr' can't be established.
ED25519 key fingerprint is SHA256:+eWiE36Y6bUQcS/+2nkyShjsxGVeK6Pa07lJZPzG/ts.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

`yes` yazın ve Enter'a basın.

## 🔒 Güvenlik Notu

Eğer bu sunucuya daha önce başarıyla bağlandıysanız ve şimdi bu hatayı alıyorsanız:
- ✅ Sunucu yeniden kurulduysa normal (güvenli)
- ⚠️ Beklenmedik bir durumsa dikkatli olun
- ✅ Natro'dan aldığınız şifre ile bağlanabiliyorsanız sorun yok

## 🆘 Hala Bağlanamıyorsanız

1. **IP adresi ile deneyin:**
   ```powershell
   ssh root@your-server-ip
   ```

2. **Verbose mode ile hata detaylarını görün:**
   ```powershell
   ssh -v root@alo17.tr
   ```

3. **Farklı port deneyin (eğer varsa):**
   ```powershell
   ssh -p 22 root@alo17.tr
   ```

