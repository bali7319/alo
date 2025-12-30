#!/bin/bash
# PostgreSQL postgres kullanıcısı ile çalıştır

cd /var/www/alo17

# postgres kullanıcısı ile çalıştır (şifre gerektirmez)
sudo -u postgres psql -d alo17_db -f fix-database-manual.sql

# Prisma generate ve restart
npx prisma generate
pm2 restart alo17

