# Daily backup pull script (server -> Windows Desktop) for alo17
#
# What it does:
# - Creates code backup tar.gz on server (/tmp) excluding node_modules/.next/.git
# - Creates PostgreSQL DB backup via pg_dump (custom format) using DATABASE_URL from /var/www/alo17/.env
# - Downloads both files to a timestamped folder on Windows Desktop
# - Cleans up temporary files on server
#
# Recommended: run via Windows Task Scheduler daily.
#
# Usage:
#   cd C:\Users\bali\Desktop\alo
#   powershell -ExecutionPolicy Bypass -File .\scripts\deploy\BACKUP_ALO17_TO_DESKTOP_2222.ps1 `
#     -HostName "37.148.210.158" -User "root" -Port 2222 -IdentityFile "C:\Users\bali\20251973bscc20251973" `
#     -RemotePath "/var/www/alo17"
#

param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,

  [string]$User = "root",
  [int]$Port = 2222,

  [Parameter(Mandatory = $true)]
  [string]$IdentityFile,

  [string]$RemotePath = "/var/www/alo17",

  # Optional: where to save on Desktop (defaults to Desktop)
  [string]$DesktopPath = "",

  # Optional: delete local backup folders older than N days (0 = keep forever)
  [int]$RetentionDays = 14
)

try {
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
  $OutputEncoding = [Console]::OutputEncoding
} catch {}

$ErrorActionPreference = "Stop"
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

function SftpGetFile([string]$RemotePathFull, [string]$LocalPath) {
  $localDir = Split-Path -Parent $LocalPath
  if ($localDir -and -not (Test-Path -LiteralPath $localDir)) {
    New-Item -ItemType Directory -Force -Path $localDir | Out-Null
  }

  $maxAttempts = 3
  for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    $batch = @"
get "$RemotePathFull" "$LocalPath"
"@
    $out = $batch | & sftp.exe -P $Port -i $IdentityFile `
      -o BatchMode=yes `
      -o ConnectTimeout=30 `
      -o ConnectionAttempts=3 `
      -o ServerAliveInterval=15 `
      -o ServerAliveCountMax=3 `
      -b - $dest 2>&1
    if ($LASTEXITCODE -eq 0) { return }
    Write-Host $out
    if ($attempt -lt $maxAttempts) {
      Write-Host "SFTP retry ($attempt/$maxAttempts) for $RemotePathFull ..." -ForegroundColor Yellow
      Start-Sleep -Seconds (3 * $attempt)
    }
  }
  throw "SFTP get failed for $RemotePathFull"
}

function Remove-OldLocalBackups([string]$RootDir, [string]$Prefix, [int]$Days) {
  if ($Days -le 0) { return }
  if (-not (Test-Path -LiteralPath $RootDir)) { return }
  $cutoff = (Get-Date).AddDays(-$Days)
  Get-ChildItem -LiteralPath $RootDir -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "$Prefix*" -and $_.LastWriteTime -lt $cutoff } |
    ForEach-Object {
      try { Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction Stop } catch {}
    }
}

$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$desktop = if ($DesktopPath -and $DesktopPath.Trim() -ne "") { $DesktopPath } else { [Environment]::GetFolderPath('Desktop') }
$backupDir = Join-Path $desktop ("alo17-full-backup-$ts")
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$remoteCodeTar = "/tmp/alo17-code-$ts.tar.gz"
$remoteDbDump  = "/tmp/alo17-db-$ts.dump"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ALO17 DAILY BACKUP (server -> Desktop)" -ForegroundColor Yellow
Write-Host "Host: $HostName  Port: $Port  User: $User" -ForegroundColor Gray
Write-Host "RemotePath: $RemotePath" -ForegroundColor Gray
Write-Host "LocalDir: $backupDir" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "0) SSH connectivity..." -ForegroundColor Yellow
$ping = Invoke-RemoteSsh "echo ok"
if ($LASTEXITCODE -ne 0) { Write-Host $ping; throw "SSH connection failed" }

Write-Host "1) Create CODE tar.gz on server..." -ForegroundColor Yellow
Invoke-RemoteSsh "set -euo pipefail; cd /var/www; tar -czf '$remoteCodeTar' --exclude=alo17/node_modules --exclude=alo17/.next --exclude=alo17/.git --exclude=alo17/.pm2 --exclude=alo17/*.log alo17; ls -lh '$remoteCodeTar'" | ForEach-Object { $_ }

Write-Host "2) Create DB dump on server (pg_dump)..." -ForegroundColor Yellow
# Send a small bash script via stdin (normalize to LF to avoid CR issues)
$remoteScript = @'
set -euo pipefail
remote_path="$1"
dump_file="$2"

# Windows ssh can sometimes append CR to the last argument; strip it defensively.
remote_path="${remote_path//$'\r'/}"
dump_file="${dump_file//$'\r'/}"

cd "$remote_path"
if [ ! -f .env ]; then
  echo "Missing .env at $remote_path" >&2
  exit 2
fi

# Read DATABASE_URL from .env without sourcing it (dotenv files are not always valid bash)
dburl="$(grep -m1 '^DATABASE_URL=' .env | cut -d= -f2-)"

# Trim surrounding quotes if present
dburl="${dburl%\"}"; dburl="${dburl#\"}"
dburl="${dburl%\'}"; dburl="${dburl#\'}"

if [ -z "$dburl" ]; then
  echo 'DATABASE_URL not found in .env' >&2
  exit 3
fi

command -v pg_dump >/dev/null
pg_dump --format=custom --no-owner --no-privileges --dbname="$dburl" --file="$dump_file"
ls -lh "$dump_file"
'@
$remoteScriptLf = ($remoteScript -replace "`r","")
try {
  $remoteScriptLf | & ssh.exe -p $Port -i $IdentityFile `
    -o BatchMode=yes `
    -o ConnectTimeout=30 `
    -o ConnectionAttempts=3 `
    -o ServerAliveInterval=15 `
    -o ServerAliveCountMax=3 `
    $dest "bash -s -- $RemotePath $remoteDbDump" 2>&1 | ForEach-Object { $_ }
} catch {
  # Best-effort cleanup of code tar if DB step fails
  try { Invoke-RemoteSsh "rm -f '$remoteCodeTar' '$remoteDbDump' >/dev/null 2>&1 || true" | Out-Null } catch {}
  throw
}

Write-Host "3) Download backups to Desktop..." -ForegroundColor Yellow
$localCodeTar = Join-Path $backupDir ("alo17-code-$ts.tar.gz")
$localDbDump  = Join-Path $backupDir ("alo17-db-$ts.dump")
SftpGetFile -RemotePathFull $remoteCodeTar -LocalPath $localCodeTar
SftpGetFile -RemotePathFull $remoteDbDump  -LocalPath $localDbDump

Write-Host "4) Cleanup temp files on server..." -ForegroundColor Yellow
Invoke-RemoteSsh "rm -f '$remoteCodeTar' '$remoteDbDump' && echo cleaned" | ForEach-Object { $_ }

Write-Host "5) Local files:" -ForegroundColor Yellow
if (Test-Path -LiteralPath $localCodeTar) {
  $i = Get-Item -LiteralPath $localCodeTar
  Write-Host " - $($i.FullName) ($([Math]::Round($i.Length/1MB,2)) MB)" -ForegroundColor Gray
}
if (Test-Path -LiteralPath $localDbDump) {
  $i = Get-Item -LiteralPath $localDbDump
  Write-Host " - $($i.FullName) ($([Math]::Round($i.Length/1MB,2)) MB)" -ForegroundColor Gray
}

Write-Host "6) Retention cleanup (optional)..." -ForegroundColor Yellow
Remove-OldLocalBackups -RootDir $desktop -Prefix "alo17-full-backup-" -Days $RetentionDays

Write-Host ""
Write-Host "✅ Backup completed." -ForegroundColor Green

