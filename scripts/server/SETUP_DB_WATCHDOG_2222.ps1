# Install DB watchdog + systemd restart policy for PostgreSQL cluster on alo17 server (SSH 2222 + key)
#
# Usage:
#   cd C:\Users\bali\Desktop\alo
#   powershell -ExecutionPolicy Bypass -File .\scripts\server\SETUP_DB_WATCHDOG_2222.ps1 `
#     -HostName "37.148.210.158" -User "root" -Port 2222 -IdentityFile "C:\Users\bali\20251973bscc20251973"
#
param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,
  [string]$User = "root",
  [int]$Port = 2222,
  [Parameter(Mandatory = $true)]
  [string]$IdentityFile,
  # Optional: email alert settings for /etc/alo17-db-watchdog.env
  [string]$AlertEmailTo = "",
  [string]$AlertEmailFrom = "",
  [int]$AlertCooldownSec = 1800,
  # Optional SMTP (recommended if server has no local mail/sendmail)
  [string]$SmtpHost = "",
  [int]$SmtpPort = 587,
  [string]$SmtpUser = "",
  [string]$SmtpPass = "",
  [bool]$SmtpTls = $true
)

try {
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
  $OutputEncoding = [Console]::OutputEncoding
} catch {}

$dest = "$User@$HostName"

function Invoke-RemoteSsh([string]$Command) {
  & ssh.exe -p $Port -i $IdentityFile `
    -o BatchMode=yes `
    -o ConnectTimeout=30 `
    -o ConnectionAttempts=3 `
    -o ServerAliveInterval=15 `
    -o ServerAliveCountMax=3 `
    $dest $Command 2>&1
}

function SftpPut([string]$LocalPath, [string]$RemotePathFull) {
  $resolvedLocal = $LocalPath
  try {
    $resolvedLocal = (Get-Item -LiteralPath $LocalPath -ErrorAction Stop).FullName
  } catch {
    $resolvedLocal = $LocalPath
  }

  $batch = @"
put "$resolvedLocal" "$RemotePathFull"
"@

  $out = $batch | & sftp.exe -P $Port -i $IdentityFile `
    -o BatchMode=yes `
    -o ConnectTimeout=30 `
    -o ConnectionAttempts=3 `
    -o ServerAliveInterval=15 `
    -o ServerAliveCountMax=3 `
    -b - $dest 2>&1

  if ($LASTEXITCODE -ne 0) {
    Write-Host $out
    throw "SFTP put failed: $LocalPath -> $RemotePathFull"
  }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SETUP DB WATCHDOG (SSH 2222)" -ForegroundColor Yellow
Write-Host "Host: $HostName  Port: $Port  User: $User" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "0) SSH connectivity..." -ForegroundColor Yellow
$ping = Invoke-RemoteSsh "echo ok"
if ($LASTEXITCODE -ne 0) { Write-Host $ping; throw "SSH connection failed" }

Write-Host "1) Uploading files..." -ForegroundColor Yellow
$tmpDir = "/tmp/alo17-db-watchdog"
Invoke-RemoteSsh "mkdir -p '$tmpDir'" | Out-Null

SftpPut -LocalPath ".\scripts\server\alo17-db-watchdog.sh" -RemotePathFull "$tmpDir/alo17-db-watchdog.sh"
SftpPut -LocalPath ".\scripts\server\alo17-db-watchdog.service" -RemotePathFull "$tmpDir/alo17-db-watchdog.service"
SftpPut -LocalPath ".\scripts\server\alo17-db-watchdog.timer" -RemotePathFull "$tmpDir/alo17-db-watchdog.timer"
SftpPut -LocalPath ".\scripts\server\postgresql@12-main.override.conf" -RemotePathFull "$tmpDir/postgresql@12-main.override.conf"

Write-Host "2) Installing + enabling systemd units..." -ForegroundColor Yellow
# IMPORTANT: ssh remote komutlarında CRLF (\r\n) bazen systemd unit isimlerine "\r" sızdırabiliyor.
# Bu yüzden komutları tek satırda ';' ile birleştiriyoruz.
$remoteLines = @(
  "set -e",
  "install -m 0755 '$tmpDir/alo17-db-watchdog.sh' /usr/local/bin/alo17-db-watchdog.sh",
  "install -m 0644 '$tmpDir/alo17-db-watchdog.service' /etc/systemd/system/alo17-db-watchdog.service",
  "install -m 0644 '$tmpDir/alo17-db-watchdog.timer' /etc/systemd/system/alo17-db-watchdog.timer",
  "mkdir -p /etc/systemd/system/postgresql@12-main.service.d",
  "install -m 0644 '$tmpDir/postgresql@12-main.override.conf' /etc/systemd/system/postgresql@12-main.service.d/override.conf",
  # Optional env file for email alerts
  ($(if ([string]::IsNullOrWhiteSpace($AlertEmailTo)) {
      "true"
    } else {
      $smtpTlsVal = if ($SmtpTls) { "true" } else { "false" }
      $lines = @(
        "ALERT_EMAIL_TO=$AlertEmailTo",
        ($(if ([string]::IsNullOrWhiteSpace($AlertEmailFrom)) { "" } else { "ALERT_EMAIL_FROM=$AlertEmailFrom" })),
        "ALERT_COOLDOWN_SEC=$AlertCooldownSec",
        ($(if ([string]::IsNullOrWhiteSpace($SmtpHost)) { "" } else { "SMTP_HOST=$SmtpHost" })),
        ($(if ($SmtpPort -gt 0) { "SMTP_PORT=$SmtpPort" } else { "" })),
        ($(if ([string]::IsNullOrWhiteSpace($SmtpUser)) { "" } else { "SMTP_USER=$SmtpUser" })),
        ($(if ([string]::IsNullOrWhiteSpace($SmtpPass)) { "" } else { "SMTP_PASS=$SmtpPass" })),
        "SMTP_TLS=$smtpTlsVal"
      ) | Where-Object { $_ -and $_.Trim() -ne "" }

      # printf lines to env file (no CRLF issues)
      "printf '%s\n' " + (($lines | ForEach-Object { "'" + ($_.Replace("'", "'\\''")) + "'" }) -join " ") + " > /etc/alo17-db-watchdog.env"
    })),
  "systemctl daemon-reload",
  "systemctl enable --now postgresql@12-main.service",
  "systemctl enable --now alo17-db-watchdog.timer",
  "echo '--- STATUS postgresql@12-main ---'",
  "systemctl --no-pager -l status postgresql@12-main.service | head -n 60 || true",
  "echo '--- STATUS alo17-db-watchdog.timer ---'",
  "systemctl --no-pager -l status alo17-db-watchdog.timer | head -n 60 || true",
  "echo '--- LAST RUNS ---'",
  "systemctl list-timers --all | grep alo17-db-watchdog || true"
)

$remoteCmd = ($remoteLines -join '; ')
Invoke-RemoteSsh $remoteCmd | ForEach-Object { $_ }

Write-Host ""
Write-Host "✅ DB watchdog installed." -ForegroundColor Green

