@echo off
chcp 65001 >nul
setlocal

REM Her zaman bu .bat dosyasinin bulundugu klasorden calis
set "ROOT=%~dp0"
pushd "%ROOT%" >nul

echo ==========================================
echo SMTP Setup (SSH 2222) - alo17
echo ==========================================
echo Bu script, sunucuda /var/www/alo17/.env icine SMTP ayarlarini yazar
echo ve pm2 servisini restart eder.
echo.
echo Not: SMTP sifresi sorulacak (ekranda gorunmez).
echo.

set "HOSTNAME=alo17.tr"
set "PORT=2222"
set "USER=root"
set "REMOTE_PATH=/var/www/alo17"

REM Varsayilan SSH key yolu (senin eski deploy scriptinde geciyor)
set "IDENTITY_FILE=C:\Users\bali\20251973bscc20251973"

if exist "%IDENTITY_FILE%" (
  echo Key bulundu: "%IDENTITY_FILE%"
  powershell -ExecutionPolicy Bypass -File "%ROOT%scripts\deploy\SETUP_SMTP_2222.ps1" ^
    -HostName "%HOSTNAME%" -User "%USER%" -Port %PORT% -IdentityFile "%IDENTITY_FILE%" -RemotePath "%REMOTE_PATH%"
) else (
  echo UYARI: Key bulunamadi: "%IDENTITY_FILE%"
  echo SSH agent / default key ile denenecek.
  powershell -ExecutionPolicy Bypass -File "%ROOT%scripts\deploy\SETUP_SMTP_2222.ps1" ^
    -HostName "%HOSTNAME%" -User "%USER%" -Port %PORT% -RemotePath "%REMOTE_PATH%"
)

echo.
echo Bitti. Hata varsa yukaridaki ciktiyi kopyalayip gonderebilirsin.
pause
popd >nul
endlocal

