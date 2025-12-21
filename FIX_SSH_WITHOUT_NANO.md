# SSH Timeout Düzeltme (Nano Olmadan)

## Sunucuda (echo ile direkt yazma)

```bash
# Mevcut ayarları kontrol et
grep -E "ClientAlive|TCPKeepAlive" /etc/ssh/sshd_config

# Ayarları ekle (yoksa)
echo "ClientAliveInterval 60" >> /etc/ssh/sshd_config
echo "ClientAliveCountMax 3" >> /etc/ssh/sshd_config
echo "TCPKeepAlive yes" >> /etc/ssh/sshd_config

# SSH servisini yeniden başlat
systemctl restart sshd
```

## WinSCP Keepalive Ayarları

1. **Gelişmiş** (Advanced) butonuna tıklayın
2. **Connection** > **Keepalive** bölümüne gidin
3. **Enable TCP keepalives** seçeneğini işaretleyin
4. **Keepalive interval:** `30` saniye
5. **OK** tıklayın

## Alternatif: Daha Küçük Dosyalar

Eğer hala kesiliyorsa, `.next` klasörünü parçalara bölebiliriz.

