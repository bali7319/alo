## Alo17 - AbuseIPDB / zararlı outbound trafik için hızlı müdahale

### 1) Hızlı doğrulama (silme yapmaz)
PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\security\SECURITY_CHECK.ps1 -Server "root@alo17.tr"
```

### 2) Hızlı durdur/temizle (process kill + cron satırı + /tmp temizliği)
PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\security\CLEANUP_MALWARE.ps1 -Server "root@alo17.tr"
```

### 3) Kalıcılık kaynaklarını manuel kontrol (önerilen)
SSH ile:

- `crontab -l`
- `ls -la /etc/cron.d /etc/cron.hourly /etc/cron.daily`
- `systemctl list-timers --all`
- `systemctl list-unit-files --type=service | grep -Ei 'xmrig|miner|kworker|vcHoibJV'`
- `ps aux --sort=-%cpu | head -20`
- `ss -tpn state established | head -50`

### 4) Kritik: Secret ve erişim rotate
- Root şifresi
- Eğer root ile SSH açılıyorsa, `authorized_keys` kontrolü (`/root/.ssh/authorized_keys`)
- Uygulama `.env` içindeki tüm secret’lar (DB URL, NEXTAUTH_SECRET, API key’ler)
- DB kullanıcı şifreleri (Postgres/MySQL)

### 5) Sertleştirme (minimum)
- PasswordAuthentication kapat, sadece SSH key
- Fail2ban + firewall
- `apt update && apt upgrade -y` (uygun zamanda reboot)

