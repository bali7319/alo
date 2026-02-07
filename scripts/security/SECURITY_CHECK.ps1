# Güvenlik Kontrolü (Alo17) - Safe sürüm
# Amaç: Şüpheli miner/persistence izlerini hızlıca tespit etmek (silme yapmaz)
#
# Kullanım:
#   powershell -ExecutionPolicy Bypass -File .\scripts\security\SECURITY_CHECK.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\security\SECURITY_CHECK.ps1 -Server "root@alo17.tr"
#

param(
  [string]$Server = "root@alo17.tr",
  [int]$Port = 22,
  [int]$ConnectTimeoutSec = 20,
  [switch]$AllowPasswordAuth
)

$ErrorActionPreference = "Continue"

# Try to keep output readable on Windows PowerShell
try {
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
  $OutputEncoding = [Console]::OutputEncoding
} catch {}

$pattern = "xmrig|miner|crypto|stratum|kworker-0-0|vcHoibJV"
$batchMode = if ($AllowPasswordAuth.IsPresent) { "no" } else { "yes" }
$sshBaseArgs = @(
  "-p", "$Port",
  "-o", "BatchMode=$batchMode",
  "-o", "ConnectTimeout=$ConnectTimeoutSec",
  "-o", "ServerAliveInterval=5",
  "-o", "ServerAliveCountMax=1"
)

function Invoke-RemoteBash {
  param([string]$Script)
  $Script | ssh @sshBaseArgs $Server "bash -s" 2>&1
}

Write-Host "==========================================" -ForegroundColor Red
Write-Host "SECURITY CHECK (SAFE)" -ForegroundColor Yellow
Write-Host "Target: $Server  Port: $Port" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Red
Write-Host ""

Write-Host "0) Connectivity check..." -ForegroundColor Yellow
$ping = ssh @sshBaseArgs $Server "echo ok" 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host $ping
  Write-Host ""
  Write-Host "SSH connection FAILED (timeout/refused). Fix SSH access first:" -ForegroundColor Red
  Write-Host "- From your PC: Test-NetConnection 37.148.210.158 -Port 22" -ForegroundColor White
  Write-Host "- If blocked: use hosting panel console (KVM/VNC) to restore sshd/firewall, or ask provider to open/whitelist 22." -ForegroundColor White
  return
}

Write-Host "`n1) Host info..." -ForegroundColor Yellow
Invoke-RemoteBash @"
set -e
whoami
hostname
uptime
echo '---'
uname -a
"@

Write-Host "`n2) Suspicious processes..." -ForegroundColor Yellow
Invoke-RemoteBash @"
set -e
ps aux | grep -Ei '$pattern' | grep -v grep || echo 'No suspicious processes found'
"@

Write-Host "`n3) CPU snapshot (top 20)..." -ForegroundColor Yellow
Invoke-RemoteBash @"
set -e
top -bn1 | head -20
"@

Write-Host "`n4) Network (LISTEN + ESTABLISHED)..." -ForegroundColor Yellow
Invoke-RemoteBash @"
set -e
ss -tulpn 2>/dev/null | head -80 || netstat -tulpn 2>/dev/null | head -80 || true
echo '---'
ss -tpn state established 2>/dev/null | head -50 || netstat -tnp 2>/dev/null | head -50 || true
"@

Write-Host "`n5) RAM + top memory processes..." -ForegroundColor Yellow
Invoke-RemoteBash @"
set -e
free -h
echo '---'
ps aux --sort=-%mem | head -15
"@

Write-Host "`n6) Cron + grep suspicious..." -ForegroundColor Yellow
Invoke-RemoteBash @"
set -e
echo '--- root crontab ---'
crontab -l 2>/dev/null || echo 'No crontab'
echo ''
echo '--- /etc/cron.* (listing) ---'
ls -la /etc/cron.d/ /etc/cron.hourly/ /etc/cron.daily/ /etc/cron.weekly/ /etc/cron.monthly/ 2>/dev/null | head -200 || true
echo ''
echo '--- grep suspicious in cron dirs ---'
grep -RInE '$pattern' /etc/cron.d /etc/cron.hourly /etc/cron.daily /etc/cron.weekly /etc/cron.monthly 2>/dev/null | head -50 || true
"@

Write-Host "`n7) /tmp + /var/tmp suspicious filenames..." -ForegroundColor Yellow
Invoke-RemoteBash @"
set -e
find /tmp /var/tmp -xdev \( -iname '*xmrig*' -o -iname '*miner*' -o -iname '*kworker*' -o -iname '*vchoibjv*' \) -print 2>/dev/null | head -50 || echo 'Not found'
"@

Write-Host "`n8) systemd timers/services quick scan..." -ForegroundColor Yellow
Invoke-RemoteBash @"
set -e
systemctl list-timers --all --no-pager | head -120 || true
echo '---'
systemctl list-unit-files --type=service --no-pager | grep -Ei '$pattern' || true
"@

Write-Host "`n9) SSH auth log (last 80 lines)..." -ForegroundColor Yellow
Invoke-RemoteBash @"
set -e
if [ -f /var/log/auth.log ]; then
  tail -n 80 /var/log/auth.log
elif [ -f /var/log/secure ]; then
  tail -n 80 /var/log/secure
else
  echo 'auth log not found'
fi
"@

Write-Host "`n==========================================" -ForegroundColor Red
Write-Host "DONE (SAFE CHECK)" -ForegroundColor Yellow
Write-Host "No kill/remove actions. Use CLEANUP_MALWARE.ps1 for cleanup." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Red

