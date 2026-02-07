$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$exePath = Join-Path $root "release\\win-unpacked\\Kakeibo Offline.exe"
$icoPath = Join-Path $root "build\\icon.ico"

if (-not (Test-Path $exePath)) {
  Write-Host "EXE bulunamadı: $exePath"
  Write-Host "Önce şu komutu çalıştırın: npm run dist (veya en azından win-unpacked oluşacak şekilde build)"
  exit 1
}

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "Kakeibo Offline.lnk"

$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut($shortcutPath)
$sc.TargetPath = $exePath
$sc.WorkingDirectory = Split-Path -Parent $exePath
if (Test-Path $icoPath) {
  $sc.IconLocation = $icoPath
} else {
  $sc.IconLocation = "$exePath,0"
}
$sc.Save()

Write-Host "OK: Masaüstü kısayolu oluşturuldu -> $shortcutPath"

