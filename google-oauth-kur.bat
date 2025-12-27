@echo off
echo ========================================
echo Google OAuth Client ID Kurulumu
echo ========================================
echo.
echo 1. Asagidaki linke tiklayin:
echo    https://console.cloud.google.com/apis/credentials?project=jovial-circuit-460514-j9
echo.
echo 2. "+ CREATE CREDENTIALS" butonuna tiklayin
echo 3. "OAuth client ID" secin
echo 4. Application type: "Web application" secin
echo 5. Name: "Alo17 Web Client" yazin
echo.
echo 6. Authorized JavaScript origins:
echo    http://localhost:3000
echo.
echo 7. Authorized redirect URIs:
echo    http://localhost:3000/api/auth/callback/google
echo.
echo 8. CREATE butonuna tiklayin
echo 9. Client ID ve Client Secret degerlerini kopyalayin
echo.
echo ========================================
echo.
set /p CLIENT_ID="Client ID'yi girin: "
set /p CLIENT_SECRET="Client Secret'i girin: "

echo.
echo .env.local dosyasi guncelleniyor...

powershell -Command "(Get-Content .env.local) -replace 'GOOGLE_CLIENT_ID=', 'GOOGLE_CLIENT_ID=%CLIENT_ID%' | Set-Content .env.local"
powershell -Command "(Get-Content .env.local) -replace 'GOOGLE_CLIENT_SECRET=', 'GOOGLE_CLIENT_SECRET=%CLIENT_SECRET%' | Set-Content .env.local"

echo.
echo Tamamlandi! .env.local dosyasi guncellendi.
echo.
echo Sunucuyu yeniden baslatmak icin: npm run dev
echo.
pause

