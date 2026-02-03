# Restore full alo17 site (code + database) to server (SSH 2222 + key)
#
# WARNING: This is a destructive operation for the DATABASE (pg_restore --clean)
# and for the code directory (/var/www/alo17 replaced by extracted backup).
#
# Usage (PowerShell):
#   cd C:\Users\bali\Desktop\alo
#   powershell -ExecutionPolicy Bypass -File .\scripts\deploy\RESTORE_ALO17_2222.ps1 `
#     -HostName "37.148.210.158" -User "root" -Port 2222 -IdentityFile "C:\Users\bali\20251973bscc20251973" `
#     -RemotePath "/var/www/alo17" -Pm2Name "alo17" `
#     -LocalCodeTar "C:\Users\bali\Desktop\alo17-backup-YYYYMMDD-HHMMSS\alo17-backup-YYYYMMDD-HHMMSS.tar.gz" `
#     -LocalDbDump "C:\Users\bali\Desktop\alo17-db-backup-YYYYMMDD-HHMMSS\alo17-db-YYYYMMDD-HHMMSS.dump" `
#     -Confirm "YES"
#

param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,

  [string]$User = "root",
  [int]$Port = 2222,

  [Parameter(Mandatory = $true)]
  [string]$IdentityFile,

  [string]$RemotePath = "/var/www/alo17",
  [string]$Pm2Name = "alo17",

  [Parameter(Mandatory = $true)]
  [string]$LocalCodeTar,

  [Parameter(Mandatory = $true)]
  [string]$LocalDbDump,

  # Safety switch (required)
  [Parameter(Mandatory = $true)]
  [ValidateSet("YES")]
  [string]$Confirm
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

function SftpPutFile([string]$LocalPath, [string]$RemotePathFull) {
  $remoteDir = ($RemotePathFull -replace '/[^/]+$','')
  Invoke-RemoteSsh "mkdir -p '$remoteDir'" | Out-Null

  # Resolve local path as literal (avoid wildcard issues with [id] folders on Windows)
  $resolvedLocal = $LocalPath
  try {
    $resolvedLocal = (Get-Item -LiteralPath $LocalPath -ErrorAction Stop).FullName
  } catch {
    $resolvedLocal = $LocalPath
  }

  $maxAttempts = 3
  for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
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
    if ($LASTEXITCODE -eq 0) { return }
    Write-Host $out
    if ($attempt -lt $maxAttempts) {
      Write-Host "SFTP retry ($attempt/$maxAttempts) for $LocalPath ..." -ForegroundColor Yellow
      Start-Sleep -Seconds (3 * $attempt)
    }
  }
  throw "SFTP put failed for $LocalPath"
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "RESTORE ALO17 (CODE + DB) - SSH 2222" -ForegroundColor Yellow
Write-Host "Host: $HostName  Port: $Port  User: $User" -ForegroundColor Gray
Write-Host "RemotePath: $RemotePath" -ForegroundColor Gray
Write-Host "PM2 App: $Pm2Name" -ForegroundColor Gray
Write-Host "LocalCodeTar: $LocalCodeTar" -ForegroundColor Gray
Write-Host "LocalDbDump: $LocalDbDump" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "0) Preconditions..." -ForegroundColor Yellow
if (-not (Test-Path -LiteralPath $LocalCodeTar)) { throw "Local code tar missing: $LocalCodeTar" }
if (-not (Test-Path -LiteralPath $LocalDbDump)) { throw "Local db dump missing: $LocalDbDump" }
$ping = Invoke-RemoteSsh "echo ok"
if ($LASTEXITCODE -ne 0) { Write-Host $ping; throw "SSH connection failed" }

$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$remoteCodeTar = "/tmp/alo17-restore-code-$ts.tar.gz"
$remoteDbDump  = "/tmp/alo17-restore-db-$ts.dump"

Write-Host "1) Uploading backups to server (/tmp)..." -ForegroundColor Yellow
Write-Host " - Upload code tar..." -ForegroundColor Gray
SftpPutFile -LocalPath $LocalCodeTar -RemotePathFull $remoteCodeTar | Out-Null
Write-Host " - Upload db dump..." -ForegroundColor Gray
SftpPutFile -LocalPath $LocalDbDump -RemotePathFull $remoteDbDump | Out-Null

Write-Host "2) Restore on server (stop app -> restore DB -> restore code -> build -> restart)..." -ForegroundColor Yellow

# Use a single remote bash script for atomic-ish operations. Keeps old code as alo17.bak-<ts>.
$remoteScript = @"
set -euo pipefail
ts='$ts'
remote_path='$RemotePath'
pm2_name='$Pm2Name'
code_tar='$remoteCodeTar'
db_dump='$remoteDbDump'

echo '[restore] stopping pm2 app...'
pm2 stop \"\$pm2_name\" >/dev/null 2>&1 || true

echo '[restore] ensuring pg tools exist...'
command -v pg_restore >/dev/null

echo '[restore] restoring database (DESCTRUCTIVE: --clean)...'
cd \"\$remote_path\"
if [ ! -f .env ]; then
  echo '[restore] ERROR: .env missing in current remote_path' >&2
  exit 2
fi
set -a
. ./.env
set +a
if [ -z \"\${DATABASE_URL:-}\" ]; then
  echo '[restore] ERROR: DATABASE_URL not set' >&2
  exit 3
fi
pg_restore --clean --if-exists --no-owner --no-privileges --dbname=\"\$DATABASE_URL\" \"\$db_dump\"

echo '[restore] replacing code directory from tar...'
parent_dir=\$(dirname \"\$remote_path\")
dir_name=\$(basename \"\$remote_path\")
cd \"\$parent_dir\"
if [ -d \"\$dir_name\" ]; then
  mv \"\$dir_name\" \"\$dir_name.bak-\$ts\"
fi
tar -xzf \"\$code_tar\" -C \"\$parent_dir\"

echo '[restore] install + build...'
cd \"\$remote_path\"
npm ci
npm run build

echo '[restore] restart pm2 app...'
pm2 restart \"\$pm2_name\"
pm2 save

echo '[restore] cleanup temp files...'
rm -f \"\$code_tar\" \"\$db_dump\"

echo '[restore] done'
"@

# Send script via stdin to avoid quoting issues
$remoteScript | & ssh.exe -p $Port -i $IdentityFile `
  -o BatchMode=yes `
  -o ConnectTimeout=30 `
  -o ConnectionAttempts=3 `
  -o ServerAliveInterval=15 `
  -o ServerAliveCountMax=3 `
  $dest "bash -s" 2>&1 | ForEach-Object { $_ }

Write-Host ""
Write-Host "✅ Restore completed." -ForegroundColor Green
Write-Host "Test: https://alo17.tr" -ForegroundColor Cyan

