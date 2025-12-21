# SSH Bağlantı Timeout Sorunu Çözümü

## Sorun
WinSCP/SCP bağlantıları kesiliyor.

## Çözüm: SSH Timeout Ayarlarını Artır

Sunucuda şu komutları çalıştırın:

```bash
# SSH config dosyasını düzenle
nano /etc/ssh/sshd_config

# Şu satırları ekle veya güncelle:
ClientAliveInterval 60
ClientAliveCountMax 3
TCPKeepAlive yes

# SSH servisini yeniden başlat
systemctl restart sshd
```

## Alternatif: WinSCP Ayarları

WinSCP'de:
1. **Gelişmiş** (Advanced) butonuna tıklayın
2. **Connection** > **Keepalive** bölümüne gidin
3. **Enable TCP keepalives** seçeneğini işaretleyin
4. **Keepalive interval:** `30` saniye yapın

## Alternatif: Daha Küçük Dosya

Eğer hala kesiliyorsa, `.next` klasörünü daha küçük parçalara bölebiliriz veya sadece gerekli dosyaları yükleyebiliriz.

