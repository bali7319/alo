@echo off
chcp 65001 >nul
setlocal

REM Her zaman bu .bat dosyasinin bulundugu klasorden calis
set "ROOT=%~dp0"
pushd "%ROOT%" >nul

echo ==========================================
echo SendGrid Setup (SSH 2222) - alo17
echo ==========================================
echo Bu script, sunucuda /var/www/alo17/.env icine SENDGRID_* ayarlarini yazar
echo ve build+pm2 restart yapar.
echo.
echo Not: SENDGRID_API_KEY sorulacak (ekranda gorunmez).
echo.

set "HOSTNAME=alo17.tr"
set "PORT=2222"
set "USER=root"
set "REMOTE_PATH=/var/www/alo17"
set "IDENTITY_FILE=C:\Users\bali\20251973bscc20251973"

if not exist "%IDENTITY_FILE%" (
  echo HATA: Key bulunamadi: "%IDENTITY_FILE%"
  goto :end
)

powershell -ExecutionPolicy Bypass -File "%ROOT%scripts\deploy\SETUP_SENDGRID_2222.ps1" ^
  -HostName "%HOSTNAME%" -User "%USER%" -Port %PORT% -IdentityFile "%IDENTITY_FILE%" -RemotePath "%REMOTE_PATH%"

:end
echo.
echo Bitti. Hata varsa yukaridaki ciktiyi kopyalayip gonderebilirsin.
pause
popd >nul
endlocal

