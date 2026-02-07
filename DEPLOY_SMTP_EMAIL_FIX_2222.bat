@echo off
chcp 65001 >nul
setlocal

REM Her zaman bu .bat dosyasinin bulundugu klasorden calis
set "ROOT=%~dp0"
pushd "%ROOT%" >nul

echo ==========================================
echo DEPLOY SMTP/EMAIL FIX (SSH 2222) - alo17
echo ==========================================
echo Bu script, SMTP/email fix dosyalarini sunucuya yukler,
echo build alir ve pm2 restart yapar.
echo.

set "HOSTNAME=alo17.tr"
set "PORT=2222"
set "USER=root"
set "REMOTE_PATH=/var/www/alo17"
set "IDENTITY_FILE=C:\Users\bali\20251973bscc20251973"

if not exist "%IDENTITY_FILE%" (
  echo HATA: Key bulunamadi: "%IDENTITY_FILE%"
  echo Lutfen key yolunu guncelle veya deploy scriptini manuel calistir.
  goto :end
)

powershell -ExecutionPolicy Bypass -File "%ROOT%scripts\deploy\DEPLOY_SMTP_EMAIL_FIX_2222.ps1" ^
  -HostName "%HOSTNAME%" -User "%USER%" -Port %PORT% -IdentityFile "%IDENTITY_FILE%" -RemotePath "%REMOTE_PATH%"

:end
echo.
echo Bitti. Hata varsa yukaridaki ciktiyi kopyalayip gonderebilirsin.
pause
popd >nul
endlocal

