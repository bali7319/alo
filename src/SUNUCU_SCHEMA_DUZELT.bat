@echo off
REM Sunucuda Prisma schema'yı PostgreSQL'e çevir (Windows için)

cd /d C:\Users\bali\Desktop\alo

REM Schema'yı PostgreSQL'e çevir
powershell -Command "(Get-Content prisma\schema.prisma) -replace 'provider = \"sqlite\"', 'provider = \"postgresql\"' | Set-Content prisma\schema.prisma"

REM Prisma generate
npx prisma generate

echo Schema PostgreSQL'e çevrildi ve Prisma Client generate edildi.
pause
